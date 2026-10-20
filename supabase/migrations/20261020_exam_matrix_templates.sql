-- Additive migration: reusable dynamic exam matrices. Does not alter existing tables.
create table if not exists public.exam_matrix_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null,
  grade text not null,
  duration_minutes integer not null default 45 check (duration_minutes > 0),
  matrix_data jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists exam_matrix_templates_user_updated_idx
  on public.exam_matrix_templates(user_id, updated_at desc);
alter table public.exam_matrix_templates enable row level security;
drop policy if exists "Users read own exam matrix templates" on public.exam_matrix_templates;
create policy "Users read own exam matrix templates" on public.exam_matrix_templates
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users insert own exam matrix templates" on public.exam_matrix_templates;
create policy "Users insert own exam matrix templates" on public.exam_matrix_templates
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users update own exam matrix templates" on public.exam_matrix_templates;
create policy "Users update own exam matrix templates" on public.exam_matrix_templates
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users delete own exam matrix templates" on public.exam_matrix_templates;
create policy "Users delete own exam matrix templates" on public.exam_matrix_templates
  for delete to authenticated using (user_id = auth.uid());
