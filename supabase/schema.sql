create extension if not exists pgcrypto;

do $$ begin create type app_role as enum ('admin','teacher','student'); exception when duplicate_object then null; end $$;
do $$ begin create type question_type as enum ('mcq','tf','short','essay'); exception when duplicate_object then null; end $$;

create table if not exists profiles(id uuid primary key references auth.users(id) on delete cascade,role app_role not null default 'student',student_code text unique,full_name text,grade text,class_name text,active boolean not null default true,created_at timestamptz default now());
create table if not exists curriculum(id uuid primary key default gen_random_uuid(),grade text not null,chapter_code text not null,chapter_title text not null,lesson_no int,lesson_title text not null,sort_order int default 0,status text default 'draft',unique(grade,chapter_code,lesson_title));
create table if not exists resources(id uuid primary key default gen_random_uuid(),title text not null,grade text,lesson_id uuid references curriculum(id) on delete set null,type text not null,url text,storage_path text,rights text default 'external-link',status text default 'draft',metadata jsonb default '{}'::jsonb,created_at timestamptz default now());
create table if not exists experiments(id uuid primary key default gen_random_uuid(),lesson_id uuid references curriculum(id) on delete set null,title text not null,mode text not null,config jsonb default '{}'::jsonb,status text default 'draft');
create table if not exists question_bank(id uuid primary key default gen_random_uuid(),lesson_id uuid references curriculum(id) on delete set null,type question_type not null,prompt text not null,options jsonb,answer jsonb,points numeric(6,2) default 0.25,media jsonb,metadata jsonb default '{}'::jsonb,status text default 'draft');
create table if not exists exams(id uuid primary key default gen_random_uuid(),title text not null,grade text,open_at timestamptz,close_at timestamptz,max_attempts int default 1,fullscreen_required boolean default true,tab_violation_limit int default 2,shuffle_questions boolean default true,shuffle_options boolean default true,matrix jsonb default '{}'::jsonb,status text default 'draft');
create table if not exists exam_attempts(id uuid primary key default gen_random_uuid(),exam_id uuid references exams(id) on delete cascade,user_id uuid references auth.users(id) on delete set null,question_order jsonb,answers jsonb,work jsonb,violations int default 0,started_at timestamptz,submitted_at timestamptz,score numeric(7,2),status text default 'in_progress');
create table if not exists chat_messages(id uuid primary key default gen_random_uuid(),class_name text,channel text not null,user_id uuid references auth.users(id) on delete set null,body text not null,reported boolean default false,created_at timestamptz default now());
create table if not exists audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references auth.users(id) on delete set null,action text not null,entity text,entity_id uuid,metadata jsonb default '{}'::jsonb,created_at timestamptz default now());

create index if not exists idx_curriculum_grade on curriculum(grade); create index if not exists idx_resources_lesson on resources(lesson_id); create index if not exists idx_attempts_exam on exam_attempts(exam_id);

create or replace function public.current_role() returns app_role language sql stable security definer set search_path=public as $$ select role from public.profiles where id=auth.uid() $$;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$ select coalesce(public.current_role() in ('admin','teacher'),false) $$;

alter table profiles enable row level security; alter table curriculum enable row level security; alter table resources enable row level security; alter table experiments enable row level security; alter table question_bank enable row level security; alter table exams enable row level security; alter table exam_attempts enable row level security; alter table chat_messages enable row level security; alter table audit_logs enable row level security;

drop policy if exists profiles_self on profiles; create policy profiles_self on profiles for select using (id=auth.uid() or public.current_role() in ('admin','teacher'));
drop policy if exists staff_profiles_write on profiles; create policy staff_profiles_write on profiles for all using (public.current_role()='admin') with check (public.current_role()='admin');
drop policy if exists curriculum_read on curriculum; create policy curriculum_read on curriculum for select using (status='published' or public.is_staff());
drop policy if exists curriculum_staff_write on curriculum; create policy curriculum_staff_write on curriculum for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists resources_read on resources; create policy resources_read on resources for select using (status='published' or public.is_staff());
drop policy if exists resources_staff_write on resources; create policy resources_staff_write on resources for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists experiments_read on experiments; create policy experiments_read on experiments for select using (status='published' or public.is_staff());
drop policy if exists experiments_staff_write on experiments; create policy experiments_staff_write on experiments for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists questions_staff on question_bank; create policy questions_staff on question_bank for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists exams_read on exams; create policy exams_read on exams for select using ((status='published') or public.is_staff());
drop policy if exists exams_staff on exams; create policy exams_staff on exams for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists attempts_own on exam_attempts; create policy attempts_own on exam_attempts for select using (user_id=auth.uid() or public.is_staff());
drop policy if exists attempts_insert on exam_attempts; create policy attempts_insert on exam_attempts for insert with check (user_id=auth.uid());
drop policy if exists attempts_update on exam_attempts; create policy attempts_update on exam_attempts for update using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());
drop policy if exists chat_read on chat_messages; create policy chat_read on chat_messages for select using (auth.uid() is not null);
drop policy if exists chat_insert on chat_messages; create policy chat_insert on chat_messages for insert with check (user_id=auth.uid());
drop policy if exists chat_staff on chat_messages; create policy chat_staff on chat_messages for update,delete using (public.is_staff());
drop policy if exists audit_staff on audit_logs; create policy audit_staff on audit_logs for select using (public.current_role()='admin');
drop policy if exists audit_insert on audit_logs; create policy audit_insert on audit_logs for insert with check (actor_id=auth.uid() or public.current_role()='admin');

-- Create a profile automatically for new Auth users; role can be set by an admin later.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''), 'student') on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- V4: explicit exam composition + safe RPCs. Apply this block after the base schema.
create table if not exists exam_questions(
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  question_id uuid not null references question_bank(id) on delete restrict,
  position int not null default 0,
  points_override numeric(6,2),
  unique(exam_id,question_id),
  unique(exam_id,position)
);
create index if not exists idx_exam_questions_exam on exam_questions(exam_id,position);
alter table exam_questions enable row level security;
drop policy if exists exam_questions_staff on exam_questions;
create policy exam_questions_staff on exam_questions for all using (public.is_staff()) with check (public.is_staff());

create or replace function public.get_exam_questions(p_exam_id uuid)
returns table(id uuid,type question_type,prompt text,options jsonb,points numeric,media jsonb,metadata jsonb)
language sql stable security definer set search_path=public as $$
  select q.id,q.type,q.prompt,q.options,coalesce(eq.points_override,q.points),q.media,q.metadata
  from public.exam_questions eq join public.question_bank q on q.id=eq.question_id
  join public.exams e on e.id=eq.exam_id
  where eq.exam_id=p_exam_id and (e.status='published' or public.is_staff())
  order by eq.position;
$$;

create or replace function public.submit_exam(p_exam_id uuid,p_attempt_id uuid,p_answers jsonb,p_work jsonb,p_violations int default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q record; ans jsonb; total numeric:=0; earned numeric:=0; submitted uuid:=p_attempt_id; existing record;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into existing from public.exam_attempts where id=p_attempt_id and user_id=auth.uid() and exam_id=p_exam_id;
 if existing.id is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
 if existing.status='submitted' then return jsonb_build_object('ok',true,'attempt_id',p_attempt_id,'score',existing.score,'status','submitted'); end if;
 for q in select q.id,q.type,q.answer,coalesce(eq.points_override,q.points) as points from exam_questions eq join question_bank q on q.id=eq.question_id where eq.exam_id=p_exam_id loop
   total:=total+coalesce(q.points,0);
   ans:=p_answers->q.id::text;
   if q.type='mcq' and jsonb_typeof(ans)='string' and lower(ans #>> '{}')=lower(q.answer #>> '{}') then earned:=earned+q.points;
   elsif q.type='short' and lower(trim(ans #>> '{}'))=lower(trim(q.answer #>> '{}')) then earned:=earned+q.points;
   elsif q.type='tf' and jsonb_typeof(ans)='array' and jsonb_typeof(q.answer)='array' then
     earned:=earned+q.points*(select count(*)::numeric from generate_series(0,least(jsonb_array_length(ans),jsonb_array_length(q.answer))-1) i where ans->i=q.answer->i)/greatest(jsonb_array_length(q.answer),1);
   end if;
 end loop;
 update exam_attempts set answers=p_answers,work=p_work,violations=p_violations,submitted_at=now(),score=earned,status='submitted' where id=p_attempt_id and user_id=auth.uid();
 return jsonb_build_object('ok',true,'attempt_id',submitted,'score',earned,'max_score',total,'status','submitted');
end;$$;

grant execute on function public.get_exam_questions(uuid) to authenticated;
grant execute on function public.submit_exam(uuid,uuid,jsonb,jsonb,int) to authenticated;

create or replace function public.get_attempt_review(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a record; result jsonb;
begin
 select * into a from exam_attempts where id=p_attempt_id and (user_id=auth.uid() or public.is_staff());
 if a.id is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
 select jsonb_agg(jsonb_build_object('id',q.id,'type',q.type,'prompt',q.prompt,'options',q.options,'answer',q.answer,'points',coalesce(eq.points_override,q.points),'student_answer',a.answers->q.id::text,'work',a.work->q.id::text) order by eq.position) into result
 from exam_questions eq join question_bank q on q.id=eq.question_id where eq.exam_id=a.exam_id;
 return jsonb_build_object('attempt',to_jsonb(a),'questions',coalesce(result,'[]'::jsonb));
end;$$;
grant execute on function public.get_attempt_review(uuid) to authenticated;

alter table public.exams add column if not exists created_at timestamptz default now();
alter table public.question_bank add column if not exists created_at timestamptz default now();
alter table public.question_bank add column if not exists updated_at timestamptz default now();

-- V5: AI Core / Knowledge Base / RAG
create extension if not exists vector;

create table if not exists knowledge_documents(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  grade text,
  subject text,
  chapter text,
  lesson_id uuid references curriculum(id) on delete set null,
  source_type text not null default 'teacher',
  source_url text,
  rights text default 'internal',
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'published',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists knowledge_chunks(
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references knowledge_documents(id) on delete cascade,
  lesson_id uuid references curriculum(id) on delete set null,
  chunk_index int not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique(document_id,chunk_index)
);
create index if not exists idx_knowledge_chunks_lesson on knowledge_chunks(lesson_id);
create index if not exists idx_knowledge_chunks_embedding on knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists=50);

create table if not exists ai_conversations(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  grade text,
  lesson_id uuid references curriculum(id) on delete set null,
  mode text not null default 'tutor',
  created_at timestamptz default now()
);
create table if not exists ai_messages(
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('user','assistant','system')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists ai_usage_logs(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  model text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists student_learning_profile(
  user_id uuid primary key references auth.users(id) on delete cascade,
  strengths jsonb default '[]'::jsonb,
  gaps jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
create table if not exists learning_events(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  lesson_id uuid references curriculum(id) on delete set null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table knowledge_documents enable row level security;
alter table knowledge_chunks enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table ai_usage_logs enable row level security;
alter table student_learning_profile enable row level security;
alter table learning_events enable row level security;

drop policy if exists knowledge_documents_read on knowledge_documents; create policy knowledge_documents_read on knowledge_documents for select using (status='published' or public.is_staff());
drop policy if exists knowledge_documents_staff on knowledge_documents; create policy knowledge_documents_staff on knowledge_documents for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists knowledge_chunks_read on knowledge_chunks; create policy knowledge_chunks_read on knowledge_chunks for select using (exists(select 1 from knowledge_documents d where d.id=document_id and (d.status='published' or public.is_staff())));
drop policy if exists knowledge_chunks_staff on knowledge_chunks; create policy knowledge_chunks_staff on knowledge_chunks for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists ai_conv_own on ai_conversations; create policy ai_conv_own on ai_conversations for all using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());
drop policy if exists ai_msg_own on ai_messages; create policy ai_msg_own on ai_messages for all using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());
drop policy if exists ai_usage_own on ai_usage_logs; create policy ai_usage_own on ai_usage_logs for select using (user_id=auth.uid() or public.is_staff());
drop policy if exists ai_usage_insert on ai_usage_logs; create policy ai_usage_insert on ai_usage_logs for insert with check (user_id=auth.uid() or public.is_staff());
drop policy if exists learning_profile_own on student_learning_profile; create policy learning_profile_own on student_learning_profile for all using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());
drop policy if exists learning_events_own on learning_events; create policy learning_events_own on learning_events for all using (user_id=auth.uid() or public.is_staff()) with check (user_id=auth.uid() or public.is_staff());

grant select on knowledge_documents,knowledge_chunks to authenticated;
grant select,insert,update,delete on ai_conversations,ai_messages,learning_events,student_learning_profile to authenticated;
grant select,insert on ai_usage_logs to authenticated;

drop function if exists public.match_knowledge_chunks(vector(1536),float,int,text);
create or replace function public.match_knowledge_chunks(query_embedding vector(1536), match_threshold float default 0.70, match_count int default 6, filter_lesson_id text default null)
returns table(id uuid,document_id uuid,lesson_id uuid,content text,similarity float,metadata jsonb)
language sql stable security definer set search_path=public as $$
  select kc.id,kc.document_id,kc.lesson_id,kc.content,1-(kc.embedding<=>query_embedding) as similarity,kc.metadata
  from knowledge_chunks kc join knowledge_documents kd on kd.id=kc.document_id
  where kd.status='published' and kc.embedding is not null
    and (filter_lesson_id is null or kc.lesson_id::text=filter_lesson_id)
    and 1-(kc.embedding<=>query_embedding)>=match_threshold
  order by kc.embedding<=>query_embedding limit greatest(match_count,1);
$$;
grant execute on function public.match_knowledge_chunks(vector(1536),float,int,text) to authenticated;

-- V5 hardening: server-side exam window checks.
create or replace function public.submit_exam(p_exam_id uuid,p_attempt_id uuid,p_answers jsonb,p_work jsonb,p_violations int default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q record; ans jsonb; total numeric:=0; earned numeric:=0; submitted uuid:=p_attempt_id; existing record; e record;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into e from public.exams where id=p_exam_id and status='published';
 if e.id is null then raise exception 'EXAM_NOT_AVAILABLE'; end if;
 if e.open_at is not null and now()<e.open_at then raise exception 'EXAM_NOT_OPEN'; end if;
 if e.close_at is not null and now()>e.close_at then raise exception 'EXAM_CLOSED'; end if;
 select * into existing from public.exam_attempts where id=p_attempt_id and user_id=auth.uid() and exam_id=p_exam_id;
 if existing.id is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
 if existing.status='submitted' then return jsonb_build_object('ok',true,'attempt_id',p_attempt_id,'score',existing.score,'status','submitted'); end if;
 for q in select q.id,q.type,q.answer,coalesce(eq.points_override,q.points) as points from exam_questions eq join question_bank q on q.id=eq.question_id where eq.exam_id=p_exam_id loop
   total:=total+coalesce(q.points,0); ans:=p_answers->q.id::text;
   if q.type='mcq' and jsonb_typeof(ans)='string' and lower(ans #>> '{}')=lower(q.answer #>> '{}') then earned:=earned+q.points;
   elsif q.type='short' and lower(trim(ans #>> '{}'))=lower(trim(q.answer #>> '{}')) then earned:=earned+q.points;
   elsif q.type='tf' and jsonb_typeof(ans)='array' and jsonb_typeof(q.answer)='array' then earned:=earned+q.points*(select count(*)::numeric from generate_series(0,least(jsonb_array_length(ans),jsonb_array_length(q.answer))-1) i where ans->i=q.answer->i)/greatest(jsonb_array_length(q.answer),1);
   end if;
 end loop;
 update exam_attempts set answers=p_answers,work=p_work,violations=p_violations,submitted_at=now(),score=earned,status='submitted' where id=p_attempt_id and user_id=auth.uid();
 return jsonb_build_object('ok',true,'attempt_id',submitted,'score',earned,'max_score',total,'status','submitted');
end;$$;

-- V6: AI Teacher Studio / persistent projects
create table if not exists ai_teacher_projects(
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  kind text not null check(kind in ('lesson_plan','question_set','matrix','exam_blueprint','question_review','activity')),
  title text not null,
  grade text,
  lesson_id uuid references curriculum(id) on delete set null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check(status in ('draft','final','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ai_teacher_projects_user on ai_teacher_projects(created_by,created_at desc);
create index if not exists idx_ai_teacher_projects_lesson on ai_teacher_projects(lesson_id);
alter table ai_teacher_projects enable row level security;
drop policy if exists ai_teacher_projects_own on ai_teacher_projects;
create policy ai_teacher_projects_own on ai_teacher_projects for all using(created_by=auth.uid() or public.is_staff()) with check(created_by=auth.uid() or public.is_staff());
grant select,insert,update,delete on ai_teacher_projects to authenticated;

-- V6: generated question metadata for traceability
alter table question_bank add column if not exists ai_source_project_id uuid references ai_teacher_projects(id) on delete set null;
create index if not exists idx_question_bank_ai_project on question_bank(ai_source_project_id);

-- V7: AI Student personalized learning
create table if not exists personalized_practice_sets(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  instructions text default '',
  questions jsonb not null default '[]'::jsonb,
  source_gaps jsonb not null default '[]'::jsonb,
  status text not null default 'ready' check(status in ('draft','ready','completed','archived')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_personalized_practice_user on personalized_practice_sets(user_id,created_at desc);
alter table personalized_practice_sets enable row level security;
drop policy if exists personalized_practice_own on personalized_practice_sets;
create policy personalized_practice_own on personalized_practice_sets for all using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
grant select,insert,update,delete on personalized_practice_sets to authenticated;


-- V8: Adaptive Learning Engine
create table if not exists adaptive_learning_plans(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  horizon_days int not null default 7,
  items jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  status text not null default 'active' check(status in ('active','completed','archived'))
);
create index if not exists idx_adaptive_plans_user on adaptive_learning_plans(user_id,generated_at desc);
alter table adaptive_learning_plans enable row level security;
drop policy if exists adaptive_plans_own on adaptive_learning_plans;
create policy adaptive_plans_own on adaptive_learning_plans for all using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
grant select,insert,update,delete on adaptive_learning_plans to authenticated;

alter table personalized_practice_sets add column if not exists difficulty text default 'mixed';
alter table personalized_practice_sets add column if not exists result jsonb;

-- V8: event generated when an exam is successfully submitted.
-- Existing scoring behavior is unchanged; this only records a learning signal.
create or replace function public.submit_exam(p_exam_id uuid,p_attempt_id uuid,p_answers jsonb,p_work jsonb,p_violations int default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q record; ans jsonb; total numeric:=0; earned numeric:=0; submitted uuid:=p_attempt_id; existing record; e record; result jsonb;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into e from public.exams where id=p_exam_id and status='published';
 if e.id is null then raise exception 'EXAM_NOT_AVAILABLE'; end if;
 if e.open_at is not null and now()<e.open_at then raise exception 'EXAM_NOT_OPEN'; end if;
 if e.close_at is not null and now()>e.close_at then raise exception 'EXAM_CLOSED'; end if;
 select * into existing from public.exam_attempts where id=p_attempt_id and user_id=auth.uid() and exam_id=p_exam_id;
 if existing.id is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
 if existing.status='submitted' then return jsonb_build_object('ok',true,'attempt_id',p_attempt_id,'score',existing.score,'status','submitted'); end if;
 for q in select q.id,q.type,q.answer,coalesce(eq.points_override,q.points) as points from exam_questions eq join question_bank q on q.id=eq.question_id where eq.exam_id=p_exam_id loop
   total:=total+coalesce(q.points,0); ans:=p_answers->q.id::text;
   if q.type='mcq' and jsonb_typeof(ans)='string' and lower(ans #>> '{}')=lower(q.answer #>> '{}') then earned:=earned+q.points;
   elsif q.type='short' and lower(trim(ans #>> '{}'))=lower(trim(q.answer #>> '{}')) then earned:=earned+q.points;
   elsif q.type='tf' and jsonb_typeof(ans)='array' and jsonb_typeof(q.answer)='array' then earned:=earned+q.points*(select count(*)::numeric from generate_series(0,least(jsonb_array_length(ans),jsonb_array_length(q.answer))-1) i where ans->i=q.answer->i)/greatest(jsonb_array_length(q.answer),1);
   end if;
 end loop;
 result:=jsonb_build_object('ok',true,'attempt_id',p_attempt_id,'score',earned,'max_score',total,'status','submitted');
 update exam_attempts set answers=p_answers,work=p_work,violations=p_violations,submitted_at=now(),score=earned,status='submitted' where id=p_attempt_id;
 insert into learning_events(user_id,event_type,payload) values(auth.uid(),'exam_completed',jsonb_build_object('attempt_id',p_attempt_id,'exam_id',p_exam_id,'score',earned,'max_score',total));
 return result;
end; $$;


-- V9: AI Learning Path - connects adaptive plans to curriculum resources and progress
create table if not exists ai_learning_paths(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references adaptive_learning_plans(id) on delete set null,
  summary jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'active' check(status in ('active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ai_learning_paths_user on ai_learning_paths(user_id,created_at desc);
alter table ai_learning_paths enable row level security;
drop policy if exists ai_learning_paths_own on ai_learning_paths;
create policy ai_learning_paths_own on ai_learning_paths for all using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
grant select,insert,update,delete on ai_learning_paths to authenticated;

-- V10: AI Master Teacher - class analytics and interventions
create table if not exists teacher_master_reports(
  id uuid primary key default gen_random_uuid(), created_by uuid not null references auth.users(id) on delete cascade,
  class_name text, grade text, report jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists idx_teacher_master_reports_creator on teacher_master_reports(created_by,created_at desc);
alter table teacher_master_reports enable row level security;
drop policy if exists teacher_master_reports_staff on teacher_master_reports;
create policy teacher_master_reports_staff on teacher_master_reports for all using(public.is_staff()) with check(public.is_staff());
grant select,insert,update,delete on teacher_master_reports to authenticated;

create table if not exists teacher_interventions(
  id uuid primary key default gen_random_uuid(), created_by uuid not null references auth.users(id) on delete cascade,
  title text not null, class_name text, grade text, lesson_ids uuid[] default '{}', student_ids uuid[] default '{}',
  input jsonb not null default '{}'::jsonb, plan jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check(status in ('draft','active','completed','archived')), created_at timestamptz not null default now()
);
create index if not exists idx_teacher_interventions_creator on teacher_interventions(created_by,created_at desc);
alter table teacher_interventions enable row level security;
drop policy if exists teacher_interventions_staff on teacher_interventions;
create policy teacher_interventions_staff on teacher_interventions for all using(public.is_staff()) with check(public.is_staff());
grant select,insert,update,delete on teacher_interventions to authenticated;
