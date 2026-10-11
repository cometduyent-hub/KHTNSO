-- KHTN SỐ - Schema mở rộng V11 (migration bổ sung, không xóa/đổi tên bảng cũ)
-- Chạy trên Supabase SQL Editor sau khi sao lưu DB và thử trên môi trường staging.
-- Migration bổ sung dữ liệu cho thư viện, lớp học, thực hành, sáng tạo, game, chat và quản trị.
-- Không thay thế phần code Next.js/API; upload file còn cần cấu hình Supabase Storage và code giao diện.

begin;

-- 1. Bổ sung metadata cho bảng resources hiện có
alter table public.resources add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.resources add column if not exists updated_at timestamptz not null default now();
alter table public.resources add column if not exists file_name text;
alter table public.resources add column if not exists mime_type text;
alter table public.resources add column if not exists size_bytes bigint;
alter table public.resources add column if not exists thumbnail_url text;
alter table public.resources add column if not exists published_at timestamptz;
alter table public.resources add column if not exists sort_order integer not null default 0;
alter table public.resources add column if not exists tags text[] not null default '{}';
alter table public.resources add column if not exists semester text;
alter table public.resources add column if not exists school_year text;
alter table public.resources add column if not exists difficulty text;
alter table public.resources add column if not exists is_downloadable boolean not null default true;
alter table public.resources add column if not exists is_featured boolean not null default false;
create index if not exists idx_resources_grade_status on public.resources(grade,status);
create index if not exists idx_resources_type on public.resources(type);
create index if not exists idx_resources_tags on public.resources using gin(tags);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at before update on public.resources for each row execute function public.set_updated_at();

-- 2. Lớp học và thành viên
create table if not exists public.classes (
 id uuid primary key default gen_random_uuid(), name text not null, grade text not null,
 school_name text, school_year text, homeroom_teacher_id uuid references auth.users(id) on delete set null,
 description text, status text not null default 'active' check(status in ('active','archived')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.class_members (
 id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 member_role text not null default 'student' check(member_role in ('teacher','student')),
 joined_at timestamptz not null default now(), active boolean not null default true, unique(class_id,user_id)
);
create index if not exists idx_class_members_user on public.class_members(user_id,active);
create index if not exists idx_class_members_class on public.class_members(class_id,active);

create table if not exists public.lesson_progress (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id uuid not null references public.curriculum(id) on delete cascade,
 status text not null default 'not_started' check(status in ('not_started','in_progress','completed')),
 progress_percent numeric(5,2) not null default 0 check(progress_percent between 0 and 100),
 last_position jsonb not null default '{}'::jsonb, started_at timestamptz, completed_at timestamptz,
 updated_at timestamptz not null default now(), unique(user_id,lesson_id)
);
create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id,updated_at desc);

-- 3. Thư viện: hoạt động và bình luận
create table if not exists public.resource_activity (
 id uuid primary key default gen_random_uuid(), resource_id uuid not null references public.resources(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null,
 activity_type text not null check(activity_type in ('view','download','favorite')),
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists idx_resource_activity_resource on public.resource_activity(resource_id,activity_type,created_at desc);
create table if not exists public.resource_comments (
 id uuid primary key default gen_random_uuid(), resource_id uuid not null references public.resources(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid references public.resource_comments(id) on delete cascade,
 body text not null check(length(trim(body)) between 1 and 5000),
 status text not null default 'visible' check(status in ('visible','hidden','reported')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- 4. Phòng thực hành: báo cáo, phép đo, kết quả tính sai số
create table if not exists public.lab_reports (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id uuid references public.curriculum(id) on delete set null,
 experiment_id uuid references public.experiments(id) on delete set null,
 class_name text, title text not null, objective text, hypothesis text, method text,
 observations text, conclusion text,
 status text not null default 'draft' check(status in ('draft','submitted','reviewed','returned')),
 teacher_feedback text, score numeric(6,2), attachments jsonb not null default '[]'::jsonb,
 computed_results jsonb not null default '{}'::jsonb, submitted_at timestamptz,
 reviewed_by uuid references auth.users(id) on delete set null, reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.lab_measurements (
 id uuid primary key default gen_random_uuid(), report_id uuid not null references public.lab_reports(id) on delete cascade,
 quantity_name text not null, symbol text, unit text, instrument text, instrument_resolution numeric(14,6),
 measurements numeric[] not null default '{}', mean_value numeric(18,8), absolute_error numeric(18,8),
 relative_error_percent numeric(10,5), calculation jsonb not null default '{}'::jsonb,
 sort_order integer not null default 0, created_at timestamptz not null default now()
);
create index if not exists idx_lab_reports_user on public.lab_reports(user_id,created_at desc);
create index if not exists idx_lab_measurements_report on public.lab_measurements(report_id,sort_order);

-- 5. Kho sáng tạo: danh mục công cụ và dự án do người dùng lưu
create table if not exists public.creative_tools (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
 category text not null check(category in ('slides','design','circuit','simulation','graph','video','whiteboard','diagram','ai','other')),
 description text not null default '', website_url text not null, embed_url text, icon_url text,
 grade_levels text[] not null default '{}', capabilities text[] not null default '{}',
 access_mode text not null default 'external' check(access_mode in ('external','embed','native')),
 requires_account boolean not null default false, is_free boolean,
 sort_order integer not null default 0, status text not null default 'published' check(status in ('draft','published','archived')),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.creative_projects (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, project_type text not null default 'other', grade text,
 lesson_id uuid references public.curriculum(id) on delete set null,
 tool_id uuid references public.creative_tools(id) on delete set null,
 description text, external_url text, storage_path text, preview_url text,
 content jsonb not null default '{}'::jsonb,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 visibility text not null default 'private' check(visibility in ('private','class','public')),
 class_id uuid references public.classes(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_creative_projects_user on public.creative_projects(user_id,updated_at desc);
create index if not exists idx_creative_tools_category on public.creative_tools(category,status,sort_order);

-- 6. Game: 5 cấp độ x tối đa 30 vòng/cấp, lịch sử chơi, kim cương, avatar
create table if not exists public.game_levels (
 id uuid primary key default gen_random_uuid(), level_no integer not null unique check(level_no between 1 and 5),
 title text not null, description text, unlock_points integer not null default 0,
 map_config jsonb not null default '{}'::jsonb,
 status text not null default 'published' check(status in ('draft','published','archived')), sort_order integer not null default 0
);
create table if not exists public.game_challenges (
 id uuid primary key default gen_random_uuid(), level_id uuid not null references public.game_levels(id) on delete cascade,
 round_no integer not null check(round_no between 1 and 30), grade text,
 lesson_id uuid references public.curriculum(id) on delete set null, title text not null,
 question_ids uuid[] not null default '{}', reward_diamonds integer not null default 1 check(reward_diamonds>=0),
 time_limit_seconds integer, difficulty text not null default 'mixed',
 status text not null default 'draft' check(status in ('draft','published','archived')),
 config jsonb not null default '{}'::jsonb, unique(level_id,round_no)
);
create table if not exists public.game_attempts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 challenge_id uuid not null references public.game_challenges(id) on delete cascade,
 answers jsonb not null default '{}'::jsonb, score numeric(7,2) not null default 0,
 correct_count integer not null default 0, duration_seconds integer, diamonds_earned integer not null default 0,
 status text not null default 'in_progress' check(status in ('in_progress','completed','abandoned')),
 started_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists public.student_wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 balance bigint not null default 0 check(balance>=0), lifetime_earned bigint not null default 0 check(lifetime_earned>=0),
 updated_at timestamptz not null default now()
);
create table if not exists public.diamond_transactions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 amount integer not null check(amount<>0), reason text not null, reference_type text, reference_id uuid,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.avatar_catalog (
 id uuid primary key default gen_random_uuid(), name text not null, image_url text not null,
 rarity text not null default 'common' check(rarity in ('common','rare','epic','legendary')),
 price_diamonds integer not null default 0 check(price_diamonds>=0), unlock_rule jsonb not null default '{}'::jsonb,
 status text not null default 'published' check(status in ('draft','published','archived'))
);
create table if not exists public.student_avatars (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 avatar_id uuid not null references public.avatar_catalog(id) on delete cascade,
 acquired_at timestamptz not null default now(), equipped boolean not null default false, unique(user_id,avatar_id)
);
create index if not exists idx_game_attempts_user on public.game_attempts(user_id,started_at desc);
create index if not exists idx_diamond_transactions_user on public.diamond_transactions(user_id,created_at desc);

-- 7. Chat, tin nhắn riêng, báo cáo và thông báo
alter table public.chat_messages add column if not exists attachment jsonb not null default '[]'::jsonb;
alter table public.chat_messages add column if not exists parent_id uuid references public.chat_messages(id) on delete set null;
alter table public.chat_messages add column if not exists edited_at timestamptz;
alter table public.chat_messages add column if not exists status text not null default 'visible';
create table if not exists public.chat_reports (
 id uuid primary key default gen_random_uuid(), message_id uuid not null references public.chat_messages(id) on delete cascade,
 reporter_id uuid not null references auth.users(id) on delete cascade, reason text not null, details text,
 status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 reviewed_by uuid references auth.users(id) on delete set null, reviewed_at timestamptz,
 created_at timestamptz not null default now(), unique(message_id,reporter_id)
);
create table if not exists public.direct_conversations (
 id uuid primary key default gen_random_uuid(), created_by uuid references auth.users(id) on delete set null,
 title text, conversation_type text not null default 'direct' check(conversation_type in ('direct','group')),
 class_id uuid references public.classes(id) on delete cascade, created_at timestamptz not null default now()
);
create table if not exists public.direct_conversation_members (
 conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, joined_at timestamptz not null default now(),
 last_read_at timestamptz, primary key(conversation_id,user_id)
);
create table if not exists public.direct_messages (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade, body text not null default '',
 attachments jsonb not null default '[]'::jsonb, status text not null default 'visible' check(status in ('visible','hidden','reported')),
 created_at timestamptz not null default now(), edited_at timestamptz
);
create table if not exists public.user_notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, body text not null default '', notification_type text not null default 'info', target_url text,
 metadata jsonb not null default '{}'::jsonb, read_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists idx_direct_messages_conversation on public.direct_messages(conversation_id,created_at);
create index if not exists idx_user_notifications_user on public.user_notifications(user_id,created_at desc);

-- 8. Cấu hình nền tảng, trang nội dung và báo cáo người dùng
create table if not exists public.platform_settings (
 key text primary key, value jsonb not null default '{}'::jsonb, description text,
 is_public boolean not null default false, updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
create table if not exists public.content_pages (
 id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, summary text,
 body jsonb not null default '{}'::jsonb, status text not null default 'draft' check(status in ('draft','published','archived')),
 sort_order integer not null default 0, created_by uuid references auth.users(id) on delete set null,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.user_reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid references auth.users(id) on delete set null,
 report_type text not null, target_type text, target_id uuid, details text not null,
 status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 assigned_to uuid references auth.users(id) on delete set null, resolution text,
 created_at timestamptz not null default now(), resolved_at timestamptz
);

-- 9. Bật RLS cho bảng mới
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.resource_activity enable row level security;
alter table public.resource_comments enable row level security;
alter table public.lab_reports enable row level security;
alter table public.lab_measurements enable row level security;
alter table public.creative_tools enable row level security;
alter table public.creative_projects enable row level security;
alter table public.game_levels enable row level security;
alter table public.game_challenges enable row level security;
alter table public.game_attempts enable row level security;
alter table public.student_wallets enable row level security;
alter table public.diamond_transactions enable row level security;
alter table public.avatar_catalog enable row level security;
alter table public.student_avatars enable row level security;
alter table public.chat_reports enable row level security;
alter table public.direct_conversations enable row level security;
alter table public.direct_conversation_members enable row level security;
alter table public.direct_messages enable row level security;
alter table public.user_notifications enable row level security;
alter table public.platform_settings enable row level security;
alter table public.content_pages enable row level security;
alter table public.user_reports enable row level security;

-- Classes and memberships
drop policy if exists classes_staff_all on public.classes;
create policy classes_staff_all on public.classes for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists classes_member_read on public.classes;
create policy classes_member_read on public.classes for select using(exists(select 1 from public.class_members cm where cm.class_id=classes.id and cm.user_id=auth.uid() and cm.active));
drop policy if exists class_members_staff_all on public.class_members;
create policy class_members_staff_all on public.class_members for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists class_members_self_read on public.class_members;
create policy class_members_self_read on public.class_members for select using(user_id=auth.uid());

-- Progress and resources
drop policy if exists lesson_progress_own_all on public.lesson_progress;
create policy lesson_progress_own_all on public.lesson_progress for all using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
drop policy if exists resource_activity_read on public.resource_activity;
create policy resource_activity_read on public.resource_activity for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists resource_activity_insert on public.resource_activity;
create policy resource_activity_insert on public.resource_activity for insert with check(user_id=auth.uid() or public.is_staff());
drop policy if exists resource_comments_read on public.resource_comments;
create policy resource_comments_read on public.resource_comments for select using(status='visible' or user_id=auth.uid() or public.is_staff());
drop policy if exists resource_comments_insert on public.resource_comments;
create policy resource_comments_insert on public.resource_comments for insert with check(user_id=auth.uid());
drop policy if exists resource_comments_update on public.resource_comments;
create policy resource_comments_update on public.resource_comments for update using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
drop policy if exists resource_comments_delete on public.resource_comments;
create policy resource_comments_delete on public.resource_comments for delete using(user_id=auth.uid() or public.is_staff());

-- Lab reports and measurements
drop policy if exists lab_reports_read on public.lab_reports;
create policy lab_reports_read on public.lab_reports for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists lab_reports_insert on public.lab_reports;
create policy lab_reports_insert on public.lab_reports for insert with check(user_id=auth.uid());
drop policy if exists lab_reports_update on public.lab_reports;
create policy lab_reports_update on public.lab_reports for update using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
drop policy if exists lab_reports_delete on public.lab_reports;
create policy lab_reports_delete on public.lab_reports for delete using(user_id=auth.uid() or public.is_staff());
drop policy if exists lab_measurements_access on public.lab_measurements;
create policy lab_measurements_access on public.lab_measurements for all
using(exists(select 1 from public.lab_reports lr where lr.id=report_id and (lr.user_id=auth.uid() or public.is_staff())))
with check(exists(select 1 from public.lab_reports lr where lr.id=report_id and (lr.user_id=auth.uid() or public.is_staff())));

-- Creative tools/projects
drop policy if exists creative_tools_read on public.creative_tools;
create policy creative_tools_read on public.creative_tools for select using(status='published' or public.is_staff());
drop policy if exists creative_tools_staff_all on public.creative_tools;
create policy creative_tools_staff_all on public.creative_tools for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists creative_projects_read on public.creative_projects;
create policy creative_projects_read on public.creative_projects for select using(user_id=auth.uid() or public.is_staff() or (visibility='public' and status='published') or (visibility='class' and exists(select 1 from public.class_members cm where cm.class_id=creative_projects.class_id and cm.user_id=auth.uid() and cm.active)));
drop policy if exists creative_projects_insert on public.creative_projects;
create policy creative_projects_insert on public.creative_projects for insert with check(user_id=auth.uid());
drop policy if exists creative_projects_update on public.creative_projects;
create policy creative_projects_update on public.creative_projects for update using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
drop policy if exists creative_projects_delete on public.creative_projects;
create policy creative_projects_delete on public.creative_projects for delete using(user_id=auth.uid() or public.is_staff());

-- Game content and student results
drop policy if exists game_levels_read on public.game_levels;
create policy game_levels_read on public.game_levels for select using(status='published' or public.is_staff());
drop policy if exists game_levels_staff_all on public.game_levels;
create policy game_levels_staff_all on public.game_levels for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists game_challenges_read on public.game_challenges;
create policy game_challenges_read on public.game_challenges for select using(status='published' or public.is_staff());
drop policy if exists game_challenges_staff_all on public.game_challenges;
create policy game_challenges_staff_all on public.game_challenges for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists game_attempts_read on public.game_attempts;
create policy game_attempts_read on public.game_attempts for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists game_attempts_insert on public.game_attempts;
create policy game_attempts_insert on public.game_attempts for insert with check(user_id=auth.uid());
drop policy if exists game_attempts_update on public.game_attempts;
-- Chỉ staff được cập nhật kết quả trực tiếp; điểm/thưởng của học sinh nên được xác thực ở server/RPC.
create policy game_attempts_update on public.game_attempts for update using(public.is_staff()) with check(public.is_staff());
drop policy if exists student_wallets_read on public.student_wallets;
create policy student_wallets_read on public.student_wallets for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists student_wallets_staff_all on public.student_wallets;
create policy student_wallets_staff_all on public.student_wallets for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists diamond_transactions_read on public.diamond_transactions;
create policy diamond_transactions_read on public.diamond_transactions for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists diamond_transactions_staff_insert on public.diamond_transactions;
create policy diamond_transactions_staff_insert on public.diamond_transactions for insert with check(public.is_staff());
drop policy if exists avatar_catalog_read on public.avatar_catalog;
create policy avatar_catalog_read on public.avatar_catalog for select using(status='published' or public.is_staff());
drop policy if exists avatar_catalog_staff_all on public.avatar_catalog;
create policy avatar_catalog_staff_all on public.avatar_catalog for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists student_avatars_read on public.student_avatars;
create policy student_avatars_read on public.student_avatars for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists student_avatars_insert on public.student_avatars;
-- Không cho client tự cấp avatar miễn phí; việc mua/mở khóa cần qua RPC hoặc API kiểm tra số dư.
create policy student_avatars_insert on public.student_avatars for insert with check(public.is_staff());
drop policy if exists student_avatars_update on public.student_avatars;
create policy student_avatars_update on public.student_avatars for update using(user_id=auth.uid() or public.is_staff()) with check(user_id=auth.uid() or public.is_staff());
drop policy if exists student_avatars_delete on public.student_avatars;
create policy student_avatars_delete on public.student_avatars for delete using(user_id=auth.uid() or public.is_staff());

-- Chat, direct messages and moderation
drop policy if exists chat_reports_insert on public.chat_reports;
create policy chat_reports_insert on public.chat_reports for insert with check(reporter_id=auth.uid());
drop policy if exists chat_reports_read on public.chat_reports;
create policy chat_reports_read on public.chat_reports for select using(reporter_id=auth.uid() or public.is_staff());
drop policy if exists chat_reports_staff_update on public.chat_reports;
create policy chat_reports_staff_update on public.chat_reports for update using(public.is_staff()) with check(public.is_staff());
drop policy if exists dcm_member_read on public.direct_conversation_members;
create policy dcm_member_read on public.direct_conversation_members for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists dcm_staff_all on public.direct_conversation_members;
create policy dcm_staff_all on public.direct_conversation_members for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists dc_member_read on public.direct_conversations;
create policy dc_member_read on public.direct_conversations for select using(exists(select 1 from public.direct_conversation_members m where m.conversation_id=id and m.user_id=auth.uid()) or public.is_staff());
drop policy if exists dc_insert on public.direct_conversations;
create policy dc_insert on public.direct_conversations for insert with check(created_by=auth.uid());
drop policy if exists dm_member_read on public.direct_messages;
create policy dm_member_read on public.direct_messages for select using(exists(select 1 from public.direct_conversation_members m where m.conversation_id=direct_messages.conversation_id and m.user_id=auth.uid()) or public.is_staff());
drop policy if exists dm_member_insert on public.direct_messages;
create policy dm_member_insert on public.direct_messages for insert with check(sender_id=auth.uid() and exists(select 1 from public.direct_conversation_members m where m.conversation_id=direct_messages.conversation_id and m.user_id=auth.uid()));
drop policy if exists dm_owner_update on public.direct_messages;
create policy dm_owner_update on public.direct_messages for update using(sender_id=auth.uid() or public.is_staff()) with check(sender_id=auth.uid() or public.is_staff());

-- Notifications, settings, content pages, reports
drop policy if exists notifications_read on public.user_notifications;
create policy notifications_read on public.user_notifications for select using(user_id=auth.uid() or public.current_role()='admin');
drop policy if exists notifications_update on public.user_notifications;
create policy notifications_update on public.user_notifications for update using(user_id=auth.uid() or public.current_role()='admin') with check(user_id=auth.uid() or public.current_role()='admin');
drop policy if exists notifications_admin_insert on public.user_notifications;
create policy notifications_admin_insert on public.user_notifications for insert with check(public.current_role()='admin');
drop policy if exists settings_read on public.platform_settings;
create policy settings_read on public.platform_settings for select using(is_public or public.current_role()='admin');
drop policy if exists settings_admin_all on public.platform_settings;
create policy settings_admin_all on public.platform_settings for all using(public.current_role()='admin') with check(public.current_role()='admin');
drop policy if exists content_pages_read on public.content_pages;
create policy content_pages_read on public.content_pages for select using(status='published' or public.is_staff());
drop policy if exists content_pages_staff_all on public.content_pages;
create policy content_pages_staff_all on public.content_pages for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists user_reports_insert on public.user_reports;
create policy user_reports_insert on public.user_reports for insert with check(reporter_id=auth.uid() or reporter_id is null);
drop policy if exists user_reports_read on public.user_reports;
create policy user_reports_read on public.user_reports for select using(reporter_id=auth.uid() or public.current_role()='admin');
drop policy if exists user_reports_admin_update on public.user_reports;
create policy user_reports_admin_update on public.user_reports for update using(public.current_role()='admin') with check(public.current_role()='admin');

grant select,insert,update,delete on public.classes,public.class_members,public.lesson_progress,
 public.resource_activity,public.resource_comments,public.lab_reports,public.lab_measurements,
 public.creative_tools,public.creative_projects,public.game_levels,public.game_challenges,
 public.game_attempts,public.student_wallets,public.diamond_transactions,public.avatar_catalog,
 public.student_avatars,public.chat_reports,public.direct_conversations,public.direct_conversation_members,
 public.direct_messages,public.user_notifications,public.platform_settings,public.content_pages,public.user_reports
 to authenticated;

commit;

-- 10. Supabase Storage (cấu hình riêng, không tự chạy để tránh đổi bucket đang dùng)
-- Tạo bucket khtnso-resources dạng Private trong Dashboard > Storage.
-- Sau khi xác nhận bucket chưa tồn tại, chạy riêng:
-- insert into storage.buckets(id,name,public) values('khtnso-resources','khtnso-resources',false) on conflict(id) do nothing;
-- create policy "khtnso staff upload" on storage.objects for insert to authenticated with check(bucket_id='khtnso-resources' and public.is_staff());
-- create policy "khtnso staff update" on storage.objects for update to authenticated using(bucket_id='khtnso-resources' and public.is_staff()) with check(bucket_id='khtnso-resources' and public.is_staff());
-- create policy "khtnso staff delete" on storage.objects for delete to authenticated using(bucket_id='khtnso-resources' and public.is_staff());
-- create policy "khtnso published read" on storage.objects for select to authenticated using(bucket_id='khtnso-resources' and (public.is_staff() or exists(select 1 from public.resources r where r.storage_path=storage.objects.name and r.status='published')));

-- 11. Cấp quyền admin ban đầu: chỉ chạy thủ công khi đã xác minh đúng email chủ dự án.
-- Không tự cấp quyền admin trong migration.
-- insert into public.profiles(id,full_name,role)
-- select u.id,coalesce(u.raw_user_meta_data->>'full_name',''),'admin'::public.app_role
-- from auth.users u where lower(u.email)=lower('YOUR_ADMIN_EMAIL@example.com')
-- on conflict(id) do update set role='admin'::public.app_role;
-- Không đưa SUPABASE_SERVICE_ROLE_KEY hoặc khóa bí mật vào client-side code.

-- V11.1 security hardening and starter creative catalog.
-- Run after the migration above. This section is intentionally idempotent.
begin;

-- Restrict class chat to the user's own class unless the account is staff.
drop policy if exists chat_read on public.chat_messages;
create policy chat_read on public.chat_messages for select to authenticated
using (public.is_staff() or class_name=(select p.class_name from public.profiles p where p.id=auth.uid() and p.active=true));
drop policy if exists chat_insert on public.chat_messages;
create policy chat_insert on public.chat_messages for insert to authenticated
with check (user_id=auth.uid() and length(trim(body)) between 1 and 3000 and
 (public.is_staff() or class_name=(select p.class_name from public.profiles p where p.id=auth.uid() and p.active=true)));

-- Students must not write their own exam score/status directly. The submit_exam SECURITY DEFINER RPC
-- performs the final write after checking ownership, exam window, and objective answers.
drop policy if exists attempts_update on public.exam_attempts;
create policy attempts_update on public.exam_attempts for update to authenticated
using (public.is_staff()) with check (public.is_staff());
drop policy if exists attempts_insert on public.exam_attempts;
create policy attempts_insert on public.exam_attempts for insert to authenticated
with check (user_id=auth.uid() and status='in_progress' and score is null and submitted_at is null and exists(
 select 1 from public.exams e where e.id=exam_id and e.status='published' and
 (e.open_at is null or e.open_at<=now()) and (e.close_at is null or e.close_at>=now())
));

-- Keep resource objects private; published resources can receive signed URLs from the browser.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('khtnso-resources','khtnso-resources',false,52428800,
 array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/csv','image/png','image/jpeg','image/webp','video/mp4','video/webm','audio/mpeg','audio/wav'])
on conflict(id) do nothing;
drop policy if exists "khtnso staff upload" on storage.objects;
create policy "khtnso staff upload" on storage.objects for insert to authenticated
with check(bucket_id='khtnso-resources' and public.is_staff());
drop policy if exists "khtnso staff update" on storage.objects;
create policy "khtnso staff update" on storage.objects for update to authenticated
using(bucket_id='khtnso-resources' and public.is_staff()) with check(bucket_id='khtnso-resources' and public.is_staff());
drop policy if exists "khtnso staff delete" on storage.objects;
create policy "khtnso staff delete" on storage.objects for delete to authenticated
using(bucket_id='khtnso-resources' and public.is_staff());
drop policy if exists "khtnso published read" on storage.objects;
create policy "khtnso published read" on storage.objects for select to anon,authenticated
using(bucket_id='khtnso-resources' and (public.is_staff() or exists(
 select 1 from public.resources r where r.storage_path=storage.objects.name and r.status='published'
)));

insert into public.creative_tools(name,slug,category,description,website_url,grade_levels,capabilities,access_mode,requires_account,sort_order,status)
values
 ('Gamma','gamma','slides','Tạo bản trình chiếu và tài liệu từ dàn ý.','https://gamma.app/','{6,7,8,9,10,11,12}','{slides,ai,documents}','external',true,10,'published'),
 ('Canva','canva','design','Thiết kế bài trình chiếu, infographic, phiếu học tập và video.','https://www.canva.com/','{6,7,8,9,10,11,12}','{slides,poster,infographic,video}','external',true,20,'published'),
 ('Gemini','gemini','ai','Hỗ trợ lên ý tưởng và phát triển nội dung học tập; cần kiểm chứng đầu ra.','https://gemini.google.com/','{6,7,8,9,10,11,12}','{ai,writing,planning}','external',true,30,'published'),
 ('ChatGPT','chatgpt','ai','Hỗ trợ soạn học liệu, câu hỏi, rubric và ý tưởng STEM.','https://chatgpt.com/','{6,7,8,9,10,11,12}','{ai,writing,planning}','external',true,40,'published'),
 ('GeoGebra','geogebra','graph','Đồ thị, hình học và mô hình toán học tương tác.','https://www.geogebra.org/','{6,7,8,9,10,11,12}','{graph,geometry,simulation}','external',true,50,'published'),
 ('AutoGraph','autograph','graph','Công cụ biểu diễn và phân tích đồ thị.','https://www.autograph-maths.com/','{7,8,9,10,11,12}','{graph,data}','external',true,60,'published'),
 ('Tinkercad Circuits','tinkercad-circuits','circuit','Lắp mạch điện ảo và mô phỏng Arduino.','https://www.tinkercad.com/circuits','{8,9,10,11,12}','{circuits,electronics,simulation}','external',true,70,'published'),
 ('CircuitJS / Falstad','circuitjs-falstad','circuit','Mô phỏng mạch điện tương tác trên trình duyệt.','https://falstad.com/circuit/','{8,9,10,11,12}','{circuits,electronics,simulation}','external',false,80,'published'),
 ('PhET','phet','simulation','Mô phỏng tương tác các chủ đề khoa học.','https://phet.colorado.edu/vi/simulations/filter?subjects=physics','{6,7,8,9,10,11,12}','{simulation,physics,chemistry}','external',false,90,'published'),
 ('phyphox','phyphox','simulation','Thí nghiệm sử dụng cảm biến điện thoại và xuất dữ liệu.','https://phyphox.org/','{8,9,10,11,12}','{measurement,sensors,data}','external',false,100,'published'),
 ('CapCut','capcut','video','Dựng và biên tập video học tập.','https://www.capcut.com/','{6,7,8,9,10,11,12}','{video,editing}','external',true,110,'published'),
 ('Clipchamp','clipchamp','video','Biên tập video và ghi màn hình.','https://clipchamp.com/','{6,7,8,9,10,11,12}','{video,editing,screen-recording}','external',true,120,'published'),
 ('Powtoon','powtoon','video','Tạo video hoạt hình và bài trình bày dạng video.','https://www.powtoon.com/','{6,7,8,9,10,11,12}','{video,animation,presentation}','external',true,130,'published'),
 ('diagrams.net','diagrams-net','diagram','Vẽ sơ đồ mạch, sơ đồ khối và quy trình.','https://app.diagrams.net/','{6,7,8,9,10,11,12}','{diagram,flowchart,circuit-diagram}','external',false,140,'published'),
 ('Excalidraw','excalidraw','whiteboard','Bảng vẽ phác thảo và sơ đồ cộng tác.','https://excalidraw.com/','{6,7,8,9,10,11,12}','{whiteboard,diagram}','external',false,150,'published')
on conflict(slug) do update set name=excluded.name,category=excluded.category,description=excluded.description,website_url=excluded.website_url,grade_levels=excluded.grade_levels,capabilities=excluded.capabilities,status='published';

commit;

-- ADMIN BOOTSTRAP: only after verifying the correct account ID/email. Never grant admin to all users.
-- update public.profiles p set role='admin'::public.app_role
-- from auth.users u where p.id=u.id and lower(u.email)=lower('YOUR_VERIFIED_ADMIN_EMAIL@example.com');

-- V11.2 secure game RPCs. Students never receive answer keys or write reward balances directly.
begin;
drop policy if exists game_attempts_insert on public.game_attempts;
create policy game_attempts_insert on public.game_attempts for insert to authenticated
with check (public.is_staff());

create or replace function public.get_game_challenge(p_challenge_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare c public.game_challenges%rowtype; l public.game_levels%rowtype; qs jsonb;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into c from public.game_challenges where id=p_challenge_id and status='published';
 if c.id is null then raise exception 'CHALLENGE_NOT_AVAILABLE'; end if;
 select * into l from public.game_levels where id=c.level_id and status='published';
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'type',q.type,'prompt',q.prompt,'options',q.options,'points',q.points,'media',q.media) order by array_position(c.question_ids,q.id)), '[]'::jsonb)
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
 award:=case when total>0 then floor(c.reward_diamonds*correct::numeric/total)::integer else 0 end;
 insert into public.game_attempts(user_id,challenge_id,answers,score,correct_count,duration_seconds,diamonds_earned,status,completed_at)
 values(auth.uid(),p_challenge_id,coalesce(p_answers,'{}'::jsonb),correct,correct,greatest(coalesce(p_duration_seconds,0),0),award,'completed',now()) returning id into attempt_id;
 insert into public.student_wallets(user_id,balance,lifetime_earned,updated_at) values(auth.uid(),award,award,now())
 on conflict(user_id) do update set balance=student_wallets.balance+excluded.balance,lifetime_earned=student_wallets.lifetime_earned+excluded.lifetime_earned,updated_at=now();
 if award>0 then insert into public.diamond_transactions(user_id,amount,reason,reference_type,reference_id,metadata)
 values(auth.uid(),award,'Hoàn thành thử thách','game_challenge',p_challenge_id,jsonb_build_object('attempt_id',attempt_id,'correct',correct,'total',total)); end if;
 return jsonb_build_object('ok',true,'attempt_id',attempt_id,'score',correct,'correct_count',correct,'total_questions',total,'diamonds_earned',award,'status','completed');
end; $$;
grant execute on function public.submit_game_challenge(uuid,jsonb,integer) to authenticated;

insert into public.game_levels(level_no,title,description,unlock_points,map_config,status,sort_order) values
 (1,'Chân núi tri thức','Khởi động hành trình khoa học.',0,'{"theme":"bach-ma","stage":"base"}'::jsonb,'published',1),
 (2,'Đường mòn khám phá','Củng cố kiến thức nền tảng.',30,'{"theme":"bach-ma","stage":"trail"}'::jsonb,'published',2),
 (3,'Dốc thử thách','Vận dụng kiến thức vào tình huống mới.',70,'{"theme":"bach-ma","stage":"slope"}'::jsonb,'published',3),
 (4,'Mây phủ Bạch Mã','Giải quyết bài toán tổng hợp.',120,'{"theme":"bach-ma","stage":"clouds"}'::jsonb,'published',4),
 (5,'Đỉnh cao khoa học','Chinh phục các thử thách nâng cao.',180,'{"theme":"bach-ma","stage":"summit"}'::jsonb,'published',5)
on conflict(level_no) do update set title=excluded.title,description=excluded.description,status='published';
commit;

-- V11.3: publishing controls, private-conversation creation, and Realtime publication.
begin;
drop policy if exists creative_projects_insert on public.creative_projects;
create policy creative_projects_insert on public.creative_projects for insert to authenticated
with check (public.is_staff() or (user_id=auth.uid() and status='draft' and visibility in ('private','class')));
drop policy if exists creative_projects_update on public.creative_projects;
create policy creative_projects_update on public.creative_projects for update to authenticated
using (user_id=auth.uid() or public.is_staff())
with check (public.is_staff() or (user_id=auth.uid() and status='draft' and visibility in ('private','class')));
drop policy if exists student_avatars_update on public.student_avatars;
create policy student_avatars_update on public.student_avatars for update to authenticated
using (public.is_staff()) with check (public.is_staff());
drop policy if exists student_avatars_delete on public.student_avatars;
create policy student_avatars_delete on public.student_avatars for delete to authenticated
using (public.is_staff());

create or replace function public.create_direct_conversation(p_other_user uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid; me public.profiles%rowtype; other public.profiles%rowtype;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 if p_other_user is null or p_other_user=auth.uid() then raise exception 'INVALID_RECIPIENT'; end if;
 select * into me from public.profiles where id=auth.uid() and active=true;
 select * into other from public.profiles where id=p_other_user and active=true;
 if me.id is null or other.id is null then raise exception 'USER_NOT_AVAILABLE'; end if;
 if not public.is_staff() and coalesce(me.class_name,'')<>coalesce(other.class_name,'') then raise exception 'RECIPIENT_MUST_BE_IN_SAME_CLASS'; end if;
 insert into public.direct_conversations(created_by) values(auth.uid()) returning id into cid;
 insert into public.direct_conversation_members(conversation_id,user_id) values(cid,auth.uid()),(cid,p_other_user);
 return cid;
end; $$;
grant execute on function public.create_direct_conversation(uuid) to authenticated;

do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then
   execute 'alter publication supabase_realtime add table public.chat_messages';
 end if;
exception when undefined_object then null; end $$;
commit;

-- List only active recipients allowed to contact: same-class peers for students, all active users for staff.
create or replace function public.list_direct_recipients()
returns table(id uuid,full_name text,role public.app_role,class_name text)
language plpgsql stable security definer set search_path=public as $$
declare me public.profiles%rowtype;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into me from public.profiles where profiles.id=auth.uid() and active=true;
 if me.id is null then raise exception 'PROFILE_NOT_AVAILABLE'; end if;
 return query select p.id,p.full_name,p.role,p.class_name from public.profiles p
 where p.active=true and p.id<>auth.uid() and (public.is_staff() or (coalesce(me.class_name,'')<>'' and p.class_name=me.class_name))
 order by p.full_name nulls last;
end; $$;
grant execute on function public.list_direct_recipients() to authenticated;

-- V11.4 teacher essay grading, score audit fields, and attachment metadata.
begin;
alter table public.exam_attempts add column if not exists objective_score numeric(7,2);
alter table public.exam_attempts add column if not exists essay_score numeric(7,2) not null default 0;
alter table public.exam_attempts add column if not exists essay_feedback jsonb not null default '{}'::jsonb;
alter table public.exam_attempts add column if not exists teacher_comment text;
alter table public.exam_attempts add column if not exists graded_by uuid references auth.users(id) on delete set null;
alter table public.exam_attempts add column if not exists graded_at timestamptz;
alter table public.exam_attempts add column if not exists attachments jsonb not null default '[]'::jsonb;
update public.exam_attempts set objective_score=score where objective_score is null and status='submitted';

create or replace function public.submit_exam(p_exam_id uuid,p_attempt_id uuid,p_answers jsonb,p_work jsonb,p_violations int default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q record; ans jsonb; total numeric:=0; earned numeric:=0; existing public.exam_attempts%rowtype; e public.exams%rowtype;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into e from public.exams where id=p_exam_id and status='published';
 if e.id is null then raise exception 'EXAM_NOT_AVAILABLE'; end if;
 if e.open_at is not null and now()<e.open_at then raise exception 'EXAM_NOT_OPEN'; end if;
 if e.close_at is not null and now()>e.close_at then raise exception 'EXAM_CLOSED'; end if;
 select * into existing from public.exam_attempts where id=p_attempt_id and user_id=auth.uid() and exam_id=p_exam_id;
 if existing.id is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
 if existing.status='submitted' then return jsonb_build_object('ok',true,'attempt_id',p_attempt_id,'score',existing.score,'max_score',null,'status','submitted'); end if;
 for q in select qb.id,qb.type,qb.answer,coalesce(eq.points_override,qb.points) as points from public.exam_questions eq join public.question_bank qb on qb.id=eq.question_id where eq.exam_id=p_exam_id loop
  total:=total+coalesce(q.points,0); ans:=p_answers->q.id::text;
  if q.type='mcq' and jsonb_typeof(ans)='string' and lower(ans #>> '{}')=lower(q.answer #>> '{}') then earned:=earned+q.points;
  elsif q.type='short' and jsonb_typeof(ans)='string' and lower(trim(ans #>> '{}'))=lower(trim(q.answer #>> '{}')) then earned:=earned+q.points;
  elsif q.type='tf' and jsonb_typeof(ans)='array' and jsonb_typeof(q.answer)='array' then earned:=earned+q.points*(select count(*)::numeric from generate_series(0,least(jsonb_array_length(ans),jsonb_array_length(q.answer))-1) as gs(i) where ans->gs.i=q.answer->gs.i)/greatest(jsonb_array_length(q.answer),1);
  end if;
 end loop;
 update public.exam_attempts set answers=coalesce(p_answers,'{}'::jsonb),work=coalesce(p_work,'{}'::jsonb),violations=greatest(coalesce(p_violations,0),0),submitted_at=now(),objective_score=earned,essay_score=0,essay_feedback='{}'::jsonb,teacher_comment=null,graded_by=null,graded_at=null,score=earned,status='submitted' where id=p_attempt_id and user_id=auth.uid();
 return jsonb_build_object('ok',true,'attempt_id',p_attempt_id,'score',earned,'max_score',total,'status','submitted');
end; $$;
grant execute on function public.submit_exam(uuid,uuid,jsonb,jsonb,integer) to authenticated;
commit;

-- Private bucket for student essay attachments. Students can only upload/read within their own user-id folder; staff can review all submissions.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('khtnso-submissions','khtnso-submissions',false,10485760,
 array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','image/webp','text/plain','audio/mpeg','audio/wav','video/mp4','video/webm'])
on conflict(id) do nothing;
drop policy if exists "khtnso submissions insert" on storage.objects;
create policy "khtnso submissions insert" on storage.objects for insert to authenticated
with check(bucket_id='khtnso-submissions' and (public.is_staff() or (storage.foldername(name))[1]=auth.uid()::text));
drop policy if exists "khtnso submissions read" on storage.objects;
create policy "khtnso submissions read" on storage.objects for select to authenticated
using(bucket_id='khtnso-submissions' and (public.is_staff() or (storage.foldername(name))[1]=auth.uid()::text));
drop policy if exists "khtnso submissions delete" on storage.objects;
create policy "khtnso submissions delete" on storage.objects for delete to authenticated
using(bucket_id='khtnso-submissions' and (public.is_staff() or (storage.foldername(name))[1]=auth.uid()::text));
commit;

-- Ensure locked profiles lose staff privileges in all policies that call these helpers.
create or replace function public.current_role() returns public.app_role
language sql stable security definer set search_path=public as $$
 select role from public.profiles where id=auth.uid() and active=true
$$;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path=public as $$
 select coalesce(public.current_role() in ('admin','teacher'),false)
$$;

do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='direct_messages') then
   execute 'alter publication supabase_realtime add table public.direct_messages';
 end if;
exception when undefined_object then null; end $$;

alter table public.exams add column if not exists duration_minutes integer not null default 45 check(duration_minutes between 1 and 600);

-- Avatar catalog starter set (50 themed avatars) and safe buy/equip RPCs.
insert into public.avatar_catalog(name,image_url,rarity,price_diamonds,status)
select 'Nhà khoa học '||lpad(n::text,2,'0'),
       'https://api.dicebear.com/9.x/fun-emoji/svg?seed=KHTNSO-'||lpad(n::text,2,'0'),
       case when n%17=0 then 'legendary' when n%7=0 then 'epic' when n%3=0 then 'rare' else 'common' end,
       case when n%17=0 then 100 when n%7=0 then 50 when n%3=0 then 25 else 10 end,
       'published'
from generate_series(1,50) as g(n)
where not exists(select 1 from public.avatar_catalog a where a.name='Nhà khoa học '||lpad(n::text,2,'0'));

create or replace function public.buy_avatar(p_avatar_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.avatar_catalog%rowtype; w public.student_wallets%rowtype; already uuid;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into a from public.avatar_catalog where id=p_avatar_id and status='published';
 if a.id is null then raise exception 'AVATAR_NOT_AVAILABLE'; end if;
 select id into already from public.student_avatars where user_id=auth.uid() and avatar_id=p_avatar_id;
 if already is not null then return jsonb_build_object('ok',true,'already_owned',true); end if;
 insert into public.student_wallets(user_id,balance,lifetime_earned) values(auth.uid(),0,0) on conflict(user_id) do nothing;
 select * into w from public.student_wallets where user_id=auth.uid() for update;
 if w.balance<a.price_diamonds then raise exception 'NOT_ENOUGH_DIAMONDS'; end if;
 update public.student_wallets set balance=balance-a.price_diamonds,updated_at=now() where user_id=auth.uid();
 insert into public.student_avatars(user_id,avatar_id,equipped) values(auth.uid(),p_avatar_id,false);
 if a.price_diamonds>0 then insert into public.diamond_transactions(user_id,amount,reason,reference_type,reference_id,metadata)
 values(auth.uid(),-a.price_diamonds,'Mua avatar','avatar',p_avatar_id,jsonb_build_object('avatar_name',a.name)); end if;
 return jsonb_build_object('ok',true,'balance',w.balance-a.price_diamonds,'price',a.price_diamonds);
end; $$;
grant execute on function public.buy_avatar(uuid) to authenticated;

create or replace function public.equip_avatar(p_avatar_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare owned uuid;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select sa.id into owned from public.student_avatars sa join public.avatar_catalog ac on ac.id=sa.avatar_id
 where sa.user_id=auth.uid() and sa.avatar_id=p_avatar_id and ac.status='published';
 if owned is null then raise exception 'AVATAR_NOT_OWNED'; end if;
 update public.student_avatars set equipped=false where user_id=auth.uid();
 update public.student_avatars set equipped=true where user_id=auth.uid() and avatar_id=p_avatar_id;
 return jsonb_build_object('ok',true,'avatar_id',p_avatar_id);
end; $$;
grant execute on function public.equip_avatar(uuid) to authenticated;

-- Enforce level unlocks server-side using lifetime-earned diamonds, not client state.
create or replace function public.get_game_challenge(p_challenge_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare c public.game_challenges%rowtype; l public.game_levels%rowtype; qs jsonb; earned bigint:=0;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into c from public.game_challenges where id=p_challenge_id and status='published';
 if c.id is null then raise exception 'CHALLENGE_NOT_AVAILABLE'; end if;
 select * into l from public.game_levels where id=c.level_id and status='published';
 select coalesce(lifetime_earned,0) into earned from public.student_wallets where user_id=auth.uid();
 if not public.is_staff() and coalesce(earned,0)<coalesce(l.unlock_points,0) then raise exception 'LEVEL_LOCKED'; end if;
 if not public.is_staff() and c.grade is not null and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.grade=c.grade and p.active=true) then raise exception 'CHALLENGE_WRONG_GRADE'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'type',q.type,'prompt',q.prompt,'options',q.options,'points',q.points,'media',q.media) order by array_position(c.question_ids,q.id)), '[]'::jsonb)
 into qs from public.question_bank q where q.id=any(c.question_ids) and q.status='published' and q.type in ('mcq','tf','short');
 return jsonb_build_object('challenge',jsonb_build_object('id',c.id,'title',c.title,'round_no',c.round_no,'grade',c.grade,'reward_diamonds',c.reward_diamonds,'time_limit_seconds',c.time_limit_seconds,'difficulty',c.difficulty),'level',jsonb_build_object('level_no',l.level_no,'title',l.title,'description',l.description),'questions',qs);
end; $$;
grant execute on function public.get_game_challenge(uuid) to authenticated;

create or replace function public.submit_game_challenge(p_challenge_id uuid,p_answers jsonb,p_duration_seconds integer default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c public.game_challenges%rowtype; l public.game_levels%rowtype; q record; ans jsonb; total integer:=0; correct integer:=0; award integer:=0; attempt_id uuid; prior public.game_attempts%rowtype; earned bigint:=0;
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 select * into c from public.game_challenges where id=p_challenge_id and status='published';
 if c.id is null then raise exception 'CHALLENGE_NOT_AVAILABLE'; end if;
 select * into l from public.game_levels where id=c.level_id and status='published';
 select coalesce(lifetime_earned,0) into earned from public.student_wallets where user_id=auth.uid();
 if not public.is_staff() and coalesce(earned,0)<coalesce(l.unlock_points,0) then raise exception 'LEVEL_LOCKED'; end if;
 if not public.is_staff() and c.grade is not null and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.grade=c.grade and p.active=true) then raise exception 'CHALLENGE_WRONG_GRADE'; end if;
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
 insert into public.student_wallets(user_id,balance,lifetime_earned,updated_at) values(auth.uid(),award,award,now())
 on conflict(user_id) do update set balance=student_wallets.balance+excluded.balance,lifetime_earned=student_wallets.lifetime_earned+excluded.lifetime_earned,updated_at=now();
 if award>0 then insert into public.diamond_transactions(user_id,amount,reason,reference_type,reference_id,metadata)
 values(auth.uid(),award,'Hoàn thành thử thách','game_challenge',p_challenge_id,jsonb_build_object('attempt_id',attempt_id,'correct',correct,'total',total)); end if;
 return jsonb_build_object('ok',true,'attempt_id',attempt_id,'score',correct,'correct_count',correct,'total_questions',total,'diamonds_earned',award,'status','completed');
end; $$;
grant execute on function public.submit_game_challenge(uuid,jsonb,integer) to authenticated;

create or replace function public.get_game_leaderboard()
returns table(rank bigint,display_name text,lifetime_earned bigint)
language plpgsql stable security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;
 return query select row_number() over(order by w.lifetime_earned desc,w.updated_at asc) as rank,
   'Nhà khoa học '||upper(substr(md5(w.user_id::text),1,5)) as display_name,w.lifetime_earned
 from public.student_wallets w where w.lifetime_earned>0 order by w.lifetime_earned desc,w.updated_at asc limit 20;
end; $$;
grant execute on function public.get_game_leaderboard() to authenticated;

drop policy if exists chat_read on public.chat_messages;
create policy chat_read on public.chat_messages for select to authenticated
using (public.is_staff() or (coalesce(status,'visible')='visible' and class_name=(select p.class_name from public.profiles p where p.id=auth.uid() and p.active=true)));
