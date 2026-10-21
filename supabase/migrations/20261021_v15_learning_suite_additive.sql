-- KHTN SỐ V15 / 2026-10-23
-- Additive, idempotent migration for the EXISTING KHTNSO Supabase project.
-- This file does not drop/rename existing tables, columns, or data.
-- It does not modify Vercel environment variables or application configuration.
-- Before executing on a live database, compare against the current Supabase schema.
--
-- Run in Supabase SQL Editor for the SAME project used by the existing Vercel deployment.

begin;

-- ---------------------------------------------------------------------------
-- 1. Question bank: subject/book metadata, difficulty, media and scoring config
-- ---------------------------------------------------------------------------
alter table public.question_bank
  add column if not exists subject_code text,
  add column if not exists book_code text,
  add column if not exists difficulty text,
  add column if not exists media jsonb not null default '[]'::jsonb,
  add column if not exists scoring_config jsonb not null default '{}'::jsonb,
  add column if not exists tags text[] not null default '{}'::text[];

-- ---------------------------------------------------------------------------
-- 2. Exams: retain existing exam structure; add V15 snapshot/subject fields.
-- duration_minutes is used by the current application code.
-- ---------------------------------------------------------------------------
alter table public.exams
  add column if not exists duration_minutes integer,
  add column if not exists subject_code text,
  add column if not exists book_code text,
  add column if not exists matrix_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists scoring_snapshot jsonb not null default '{}'::jsonb;

-- Backfill duration_minutes only where it is missing, if an older duration
-- column exists. Dynamic SQL avoids an error when that legacy column is absent.
do $migration$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exams'
      and column_name = 'duration'
  ) then
    execute 'update public.exams
             set duration_minutes = duration
             where duration_minutes is null and duration is not null';
  end if;

  update public.exams
  set duration_minutes = 45
  where duration_minutes is null;

  alter table public.exams
    alter column duration_minutes set default 45;
end
$migration$;

-- ---------------------------------------------------------------------------
-- 3. Learning resources
-- ---------------------------------------------------------------------------
alter table public.resources
  add column if not exists subject_code text,
  add column if not exists book_code text,
  add column if not exists media_kind text,
  add column if not exists reward_diamonds integer not null default 0;

-- ---------------------------------------------------------------------------
-- 4. Game challenges (corrected: ADD COLUMN IF NOT EXISTS)
-- ---------------------------------------------------------------------------
alter table public.game_challenges
  add column if not exists subject_code text,
  add column if not exists book_code text;

-- ---------------------------------------------------------------------------
-- 5. Exam matrix templates
-- user_id is included for the existing per-user RLS pattern. created_by is
-- retained for compatibility with the original schema/application.
-- ---------------------------------------------------------------------------
create table if not exists public.exam_matrix_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_code text not null default 'KHTN',
  book_code text,
  grade text not null,
  duration_minutes integer not null default 45
    check (duration_minutes between 1 and 600),
  matrix_data jsonb not null default '{}'::jsonb,
  scoring_config jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  user_id uuid default auth.uid(),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.exam_matrix_templates
  add column if not exists subject_code text default 'KHTN',
  add column if not exists book_code text,
  add column if not exists duration_minutes integer default 45,
  add column if not exists matrix_data jsonb not null default '{}'::jsonb,
  add column if not exists scoring_config jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'draft',
  add column if not exists user_id uuid default auth.uid(),
  add column if not exists created_by uuid default auth.uid(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Existing records are preserved; populate ownership only where it is absent.
update public.exam_matrix_templates
set user_id = coalesce(user_id, created_by)
where user_id is null and created_by is not null;

create index if not exists exam_matrix_templates_subject_grade_idx
  on public.exam_matrix_templates(subject_code, grade, status);

-- ---------------------------------------------------------------------------
-- 6. Lesson plan documents
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_plan_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_code text not null default 'KHTN',
  grade text not null,
  book_code text,
  lesson_id uuid references public.curriculum(id) on delete set null,
  lesson_count integer not null default 2,
  learning_outcomes jsonb not null default '[]'::jsonb,
  appendix1 jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_plan_documents
  add column if not exists subject_code text default 'KHTN',
  add column if not exists book_code text,
  add column if not exists lesson_id uuid,
  add column if not exists lesson_count integer not null default 2,
  add column if not exists learning_outcomes jsonb not null default '[]'::jsonb,
  add column if not exists appendix1 jsonb not null default '{}'::jsonb,
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists media jsonb not null default '[]'::jsonb,
  add column if not exists status text not null default 'draft',
  add column if not exists created_by uuid default auth.uid(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists lesson_plan_documents_lesson_idx
  on public.lesson_plan_documents(lesson_id, status);

-- ---------------------------------------------------------------------------
-- 7. Reward rules and claims
-- ---------------------------------------------------------------------------
create table if not exists public.reward_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  title text not null,
  activity_type text not null,
  diamonds integer not null default 0 check (diamonds >= 0),
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  updated_by uuid default auth.uid(),
  updated_at timestamptz not null default now()
);

alter table public.reward_rules
  add column if not exists activity_type text,
  add column if not exists diamonds integer not null default 0,
  add column if not exists enabled boolean not null default true,
  add column if not exists config jsonb not null default '{}'::jsonb,
  add column if not exists updated_by uuid default auth.uid(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.activity_reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  activity_type text not null,
  activity_ref text not null,
  diamonds integer not null default 0 check (diamonds >= 0),
  metadata jsonb not null default '{}'::jsonb,
  claimed_at timestamptz not null default now(),
  unique(user_id, activity_type, activity_ref)
);

alter table public.activity_reward_claims
  add column if not exists user_id uuid default auth.uid(),
  add column if not exists activity_type text,
  add column if not exists activity_ref text,
  add column if not exists diamonds integer not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists claimed_at timestamptz not null default now();

create index if not exists activity_reward_claims_user_idx
  on public.activity_reward_claims(user_id, claimed_at desc);

-- Seed defaults without overwriting any teacher/admin edits.
insert into public.reward_rules(rule_key, title, activity_type, diamonds, config)
values
  ('daily_login', 'Đăng nhập hằng ngày', 'daily_login', 2,
   '{"daily_limit":1}'::jsonb),
  ('resource_read', 'Hoàn thành học liệu', 'resource_read', 3,
   '{"require_completion":true,"minimum_seconds":30}'::jsonb),
  ('video_watch', 'Hoàn thành video', 'video_watch', 5,
   '{"require_completion":true,"minimum_watch_ratio":0.9}'::jsonb),
  ('practice_complete', 'Hoàn thành luyện tập', 'practice_complete', 4,
   '{"daily_limit":10}'::jsonb),
  ('game_complete', 'Hoàn thành thử thách', 'game_complete', 5,
   '{"server_validated":true}'::jsonb)
on conflict (rule_key) do nothing;

-- ---------------------------------------------------------------------------
-- 8. Row-level security
-- Keep staff-only editing for admin content and read-only claims for users.
-- Do not add client-side INSERT/UPDATE policies for reward claims: reward
-- issuance must be validated by trusted server-side logic.
-- ---------------------------------------------------------------------------
alter table public.exam_matrix_templates enable row level security;
alter table public.lesson_plan_documents enable row level security;
alter table public.reward_rules enable row level security;
alter table public.activity_reward_claims enable row level security;

-- Matrix templates: each signed-in user can manage their own templates;
-- staff can manage all templates. These policies are recreated idempotently.
drop policy if exists exam_matrix_templates_staff on public.exam_matrix_templates;
drop policy if exists exam_matrix_templates_select_own on public.exam_matrix_templates;
drop policy if exists exam_matrix_templates_insert_own on public.exam_matrix_templates;
drop policy if exists exam_matrix_templates_update_own on public.exam_matrix_templates;
drop policy if exists exam_matrix_templates_delete_own on public.exam_matrix_templates;

create policy exam_matrix_templates_select_own
  on public.exam_matrix_templates for select
  using (user_id = auth.uid() or public.is_staff());

create policy exam_matrix_templates_insert_own
  on public.exam_matrix_templates for insert
  with check (user_id = auth.uid() or public.is_staff());

create policy exam_matrix_templates_update_own
  on public.exam_matrix_templates for update
  using (user_id = auth.uid() or public.is_staff())
  with check (user_id = auth.uid() or public.is_staff());

create policy exam_matrix_templates_delete_own
  on public.exam_matrix_templates for delete
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists lesson_plan_documents_staff on public.lesson_plan_documents;
create policy lesson_plan_documents_staff
  on public.lesson_plan_documents for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists reward_rules_staff on public.reward_rules;
create policy reward_rules_staff
  on public.reward_rules for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists activity_reward_claims_own_read on public.activity_reward_claims;
drop policy if exists activity_reward_claims_staff_read on public.activity_reward_claims;
create policy activity_reward_claims_own_read
  on public.activity_reward_claims for select
  using (user_id = auth.uid() or public.is_staff());

-- ---------------------------------------------------------------------------
-- 9. Refresh PostgREST schema cache
-- ---------------------------------------------------------------------------
notify pgrst, 'reload schema';

commit;
