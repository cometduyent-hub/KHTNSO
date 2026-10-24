-- KHTN SỐ V19+ additive gallery feature; safe to run repeatedly.
-- Does not drop/rename any existing table, column, policy, or data.
begin;

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'image' check (category in ('image','video','stem')),
  media_url text,
  thumbnail_url text,
  stem_details text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_votes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.gallery_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  score integer not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(item_id,user_id)
);

create table if not exists public.gallery_judge_scores (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.gallery_items(id) on delete cascade,
  judge_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  content_score numeric(4,1) not null default 0 check (content_score between 0 and 10),
  creativity_score numeric(4,1) not null default 0 check (creativity_score between 0 and 10),
  presentation_score numeric(4,1) not null default 0 check (presentation_score between 0 and 10),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(item_id,judge_id)
);

create index if not exists gallery_items_status_created_idx on public.gallery_items(status, created_at desc);
create index if not exists gallery_votes_item_idx on public.gallery_votes(item_id);
create index if not exists gallery_judge_scores_item_idx on public.gallery_judge_scores(item_id);

alter table public.gallery_items enable row level security;
alter table public.gallery_votes enable row level security;
alter table public.gallery_judge_scores enable row level security;

drop policy if exists gallery_items_public_read on public.gallery_items;
create policy gallery_items_public_read on public.gallery_items for select to anon, authenticated
  using (status = 'published' or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')));

drop policy if exists gallery_items_staff_manage on public.gallery_items;
create policy gallery_items_staff_manage on public.gallery_items for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')));

drop policy if exists gallery_votes_public_read on public.gallery_votes;
drop policy if exists gallery_votes_own_read on public.gallery_votes;
create policy gallery_votes_own_read on public.gallery_votes for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')));

drop policy if exists gallery_votes_own_insert on public.gallery_votes;
create policy gallery_votes_own_insert on public.gallery_votes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.gallery_items i where i.id = item_id and i.status = 'published'));

drop policy if exists gallery_votes_own_update on public.gallery_votes;
create policy gallery_votes_own_update on public.gallery_votes for update to authenticated
  using (user_id = auth.uid() and exists (select 1 from public.gallery_items i where i.id = item_id and i.status = 'published'))
  with check (user_id = auth.uid() and exists (select 1 from public.gallery_items i where i.id = item_id and i.status = 'published'));

drop policy if exists gallery_judge_scores_public_read on public.gallery_judge_scores;
drop policy if exists gallery_judge_scores_staff_read on public.gallery_judge_scores;
create policy gallery_judge_scores_staff_read on public.gallery_judge_scores for select to authenticated
  using (judge_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')));

drop policy if exists gallery_judge_scores_staff_insert on public.gallery_judge_scores;
create policy gallery_judge_scores_staff_insert on public.gallery_judge_scores for insert to authenticated
  with check (judge_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')));

drop policy if exists gallery_judge_scores_staff_update on public.gallery_judge_scores;
create policy gallery_judge_scores_staff_update on public.gallery_judge_scores for update to authenticated
  using (judge_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')))
  with check (judge_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','teacher')));

-- Public-safe aggregate RPCs expose counts/averages only, never voter/judge identities.
create or replace function public.gallery_vote_summary()
returns table(item_id uuid, average_score numeric, vote_count bigint)
language sql stable security definer set search_path = public
as $function$
  select v.item_id, round(avg(v.score)::numeric, 2), count(*)
  from public.gallery_votes v
  join public.gallery_items i on i.id = v.item_id
  where i.status = 'published'
  group by v.item_id;
$function$;

create or replace function public.gallery_judge_summary()
returns table(item_id uuid, average_score numeric, judge_count bigint)
language sql stable security definer set search_path = public
as $function$
  select s.item_id,
    round(avg((s.content_score + s.creativity_score + s.presentation_score) / 3)::numeric, 1),
    count(*)
  from public.gallery_judge_scores s
  join public.gallery_items i on i.id = s.item_id
  where i.status = 'published'
  group by s.item_id;
$function$;

grant execute on function public.gallery_vote_summary() to anon, authenticated;
grant execute on function public.gallery_judge_summary() to anon, authenticated;

commit;
