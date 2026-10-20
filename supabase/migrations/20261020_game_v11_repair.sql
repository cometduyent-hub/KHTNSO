-- KHTN SỐ V11/V12: Repair game schema when game_levels is missing.
-- Additive only: does not drop or rename existing tables and does not touch env vars.
-- Run in Supabase SQL Editor AFTER taking a database backup.
begin;

create table if not exists public.game_levels (
 id uuid primary key default gen_random_uuid(),
 level_no integer not null unique check(level_no between 1 and 5),
 title text not null,
 description text,
 unlock_points integer not null default 0,
 map_config jsonb not null default '{}'::jsonb,
 status text not null default 'published' check(status in ('draft','published','archived')),
 sort_order integer not null default 0
);

create table if not exists public.game_challenges (
 id uuid primary key default gen_random_uuid(),
 level_id uuid not null references public.game_levels(id) on delete cascade,
 round_no integer not null check(round_no between 1 and 30),
 grade text,
 lesson_id uuid references public.curriculum(id) on delete set null,
 title text not null,
 question_ids uuid[] not null default '{}',
 reward_diamonds integer not null default 1 check(reward_diamonds>=0),
 time_limit_seconds integer,
 difficulty text not null default 'mixed',
 status text not null default 'draft' check(status in ('draft','published','archived')),
 config jsonb not null default '{}'::jsonb,
 unique(level_id,round_no)
);

create table if not exists public.game_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 challenge_id uuid not null references public.game_challenges(id) on delete cascade,
 answers jsonb not null default '{}'::jsonb,
 score numeric(7,2) not null default 0,
 correct_count integer not null default 0,
 duration_seconds integer,
 diamonds_earned integer not null default 0,
 status text not null default 'in_progress' check(status in ('in_progress','completed','abandoned')),
 started_at timestamptz not null default now(),
 completed_at timestamptz
);
create table if not exists public.student_wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 balance bigint not null default 0 check(balance>=0),
 lifetime_earned bigint not null default 0 check(lifetime_earned>=0),
 updated_at timestamptz not null default now()
);
create table if not exists public.diamond_transactions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 amount integer not null check(amount<>0), reason text not null,
 reference_type text, reference_id uuid,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

create index if not exists idx_game_challenges_level_round on public.game_challenges(level_id,round_no,status);
create index if not exists idx_game_attempts_user on public.game_attempts(user_id,completed_at desc);
create index if not exists idx_diamond_transactions_user on public.diamond_transactions(user_id,created_at desc);

alter table public.game_levels enable row level security;
alter table public.game_challenges enable row level security;
alter table public.game_attempts enable row level security;
alter table public.student_wallets enable row level security;
alter table public.diamond_transactions enable row level security;

drop policy if exists game_levels_read on public.game_levels;
create policy game_levels_read on public.game_levels for select to authenticated using(status='published' or public.is_staff());
drop policy if exists game_levels_staff_all on public.game_levels;
create policy game_levels_staff_all on public.game_levels for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists game_challenges_read on public.game_challenges;
create policy game_challenges_read on public.game_challenges for select to authenticated using(status='published' or public.is_staff());
drop policy if exists game_challenges_staff_all on public.game_challenges;
create policy game_challenges_staff_all on public.game_challenges for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists game_attempts_read on public.game_attempts;
create policy game_attempts_read on public.game_attempts for select to authenticated using(user_id=auth.uid() or public.is_staff());
drop policy if exists game_attempts_insert on public.game_attempts;
create policy game_attempts_insert on public.game_attempts for insert to authenticated with check(public.is_staff());
drop policy if exists game_attempts_update on public.game_attempts;
create policy game_attempts_update on public.game_attempts for update to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists student_wallets_read on public.student_wallets;
create policy student_wallets_read on public.student_wallets for select to authenticated using(user_id=auth.uid() or public.is_staff());
drop policy if exists student_wallets_staff_all on public.student_wallets;
create policy student_wallets_staff_all on public.student_wallets for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists diamond_transactions_read on public.diamond_transactions;
create policy diamond_transactions_read on public.diamond_transactions for select to authenticated using(user_id=auth.uid() or public.is_staff());
drop policy if exists diamond_transactions_staff_all on public.diamond_transactions;
create policy diamond_transactions_staff_all on public.diamond_transactions for all to authenticated using(public.is_staff()) with check(public.is_staff());

-- Safe starter levels: create missing levels only, never overwrite administrator edits.
insert into public.game_levels(level_no,title,description,unlock_points,map_config,status,sort_order) values
 (1,'Chân núi tri thức','Khởi động hành trình học tập.',0,'{"theme":"bach-ma","stage":"base"}'::jsonb,'published',1),
 (2,'Đường mòn khám phá','Củng cố kiến thức nền tảng.',30,'{"theme":"bach-ma","stage":"trail"}'::jsonb,'published',2),
 (3,'Dốc thử thách','Vận dụng kiến thức vào tình huống mới.',70,'{"theme":"bach-ma","stage":"slope"}'::jsonb,'published',3),
 (4,'Mây phủ tri thức','Giải quyết bài toán tổng hợp.',120,'{"theme":"bach-ma","stage":"clouds"}'::jsonb,'published',4),
 (5,'Đỉnh vinh quang','Chinh phục thử thách nâng cao.',180,'{"theme":"bach-ma","stage":"summit"}'::jsonb,'published',5)
on conflict(level_no) do nothing;

-- Functions return only question text/options, never answer keys.
create or replace function public.get_game_challenge(p_challenge_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare c public.game_challenges%rowtype; l public.game_levels%rowtype; qs jsonb;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into c from public.game_challenges where id=p_challenge_id and status='published';
 if c.id is null then raise exception 'CHALLENGE_NOT_AVAILABLE'; end if;
 select * into l from public.game_levels where id=c.level_id and status='published';
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'type',q.type,'prompt',q.prompt,'options',q.options,'points',q.points,'media',q.media) order by array_position(c.question_ids,q.id)),'[]'::jsonb)
 into qs from public.question_bank q where q.id=any(c.question_ids) and q.status='published' and q.type in ('mcq','tf','short');
 return jsonb_build_object('challenge',jsonb_build_object('id',c.id,'title',c.title,'round_no',c.round_no,'grade',c.grade,'reward_diamonds',c.reward_diamonds,'time_limit_seconds',c.time_limit_seconds,'difficulty',c.difficulty),'level',jsonb_build_object('level_no',l.level_no,'title',l.title,'description',l.description),'questions',qs);
end; $$;
grant execute on function public.get_game_challenge(uuid) to authenticated;

create or replace function public.submit_game_challenge(p_challenge_id uuid,p_answers jsonb,p_duration_seconds integer default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c public.game_challenges%rowtype; q record; ans jsonb; total integer:=0; correct integer:=0; award integer:=0; attempt_id uuid; prior public.game_attempts%rowtype;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into c from public.game_challenges where id=p_challenge_id and status='published';
 if c.id is null then raise exception 'CHALLENGE_NOT_AVAILABLE'; end if;
 select * into prior from public.game_attempts where user_id=auth.uid() and challenge_id=p_challenge_id and status='completed' limit 1;
 if prior.id is not null then return jsonb_build_object('ok',true,'already_completed',true,'score',prior.score,'correct_count',prior.correct_count,'diamonds_earned',prior.diamonds_earned,'attempt_id',prior.id); end if;
 for q in select qb.id,qb.type,qb.answer from public.question_bank qb where qb.id=any(c.question_ids) and qb.status='published' and qb.type in ('mcq','tf','short') loop
  total:=total+1; ans:=p_answers->q.id::text;
  if q.type='mcq' and jsonb_typeof(ans)='string' and lower(ans #>> '{}')=lower(q.answer #>> '{}') then correct:=correct+1;
  elsif q.type='short' and jsonb_typeof(ans)='string' and lower(trim(ans #>> '{}'))=lower(trim(q.answer #>> '{}')) then correct:=correct+1;
  elsif q.type='tf' and jsonb_typeof(ans)='array' and jsonb_typeof(q.answer)='array' and jsonb_array_length(ans)=jsonb_array_length(q.answer) and not exists(select 1 from generate_series(0,jsonb_array_length(q.answer)-1) as gs(i) where ans->gs.i<>q.answer->gs.i) then correct:=correct+1;
  end if;
 end loop;
 if total=0 then raise exception 'CHALLENGE_HAS_NO_PUBLISHED_QUESTIONS'; end if;
 award:=floor(c.reward_diamonds*correct::numeric/total)::integer;
 insert into public.game_attempts(user_id,challenge_id,answers,score,correct_count,duration_seconds,diamonds_earned,status,completed_at)
 values(auth.uid(),p_challenge_id,coalesce(p_answers,'{}'::jsonb),correct,correct,greatest(coalesce(p_duration_seconds,0),0),award,'completed',now()) returning id into attempt_id;
 insert into public.student_wallets(user_id,balance,lifetime_earned,updated_at) values(auth.uid(),award,award,now()) on conflict(user_id) do update set balance=student_wallets.balance+excluded.balance,lifetime_earned=student_wallets.lifetime_earned+excluded.lifetime_earned,updated_at=now();
 if award>0 then insert into public.diamond_transactions(user_id,amount,reason,reference_type,reference_id,metadata) values(auth.uid(),award,'Hoàn thành thử thách','game_challenge',p_challenge_id,jsonb_build_object('attempt_id',attempt_id,'correct',correct,'total',total)); end if;
 return jsonb_build_object('ok',true,'attempt_id',attempt_id,'score',correct,'correct_count',correct,'total_questions',total,'diamonds_earned',award,'status','completed');
end; $$;
grant execute on function public.submit_game_challenge(uuid,jsonb,integer) to authenticated;

commit;
