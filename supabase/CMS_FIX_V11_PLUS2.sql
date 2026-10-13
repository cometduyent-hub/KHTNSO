-- KHTN SỐ V11+2: sửa quyền CMS tài nguyên và Storage theo cách idempotent.
-- Chạy trong Supabase Dashboard > SQL Editor sau khi đã sao lưu DB.
-- Không tự động cấp quyền admin cho bất kỳ tài khoản nào.

create extension if not exists pgcrypto;

do $$ begin
  if to_regclass('public.profiles') is null then
    raise exception 'Không tìm thấy public.profiles. Hãy chạy schema_full.sql trước.';
  end if;
  if to_regclass('public.resources') is null then
    raise exception 'Không tìm thấy public.resources. Hãy chạy schema_full.sql trước.';
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.resources enable row level security;

-- Người dùng đăng nhập đọc được hồ sơ của chính mình; nhân sự có quyền xem hồ sơ phục vụ CMS.
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select to authenticated
using (id=auth.uid() or public.current_role() in ('admin','teacher'));

-- Chỉ staff được thêm/sửa/xóa tài nguyên; mọi người chỉ đọc tài nguyên đã công khai.
drop policy if exists resources_read on public.resources;
create policy resources_read on public.resources for select to anon,authenticated
using (status='published' or public.is_staff());
drop policy if exists resources_staff_write on public.resources;
create policy resources_staff_write on public.resources for all to authenticated
using (public.is_staff()) with check (public.is_staff());

-- Bucket riêng tư, tối đa 50 MB. Nếu bucket đã tồn tại, cập nhật cấu hình.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('khtnso-resources','khtnso-resources',false,52428800,
 array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/csv','image/png','image/jpeg','image/webp','video/mp4','video/webm','audio/mpeg','audio/wav'])
on conflict(id) do update set name=excluded.name,public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "khtnso staff upload" on storage.objects;
create policy "khtnso staff upload" on storage.objects for insert to authenticated
with check(bucket_id='khtnso-resources' and public.is_staff());
drop policy if exists "khtnso staff update" on storage.objects;
create policy "khtnso staff update" on storage.objects for update to authenticated
using(bucket_id='khtnso-resources' and public.is_staff())
with check(bucket_id='khtnso-resources' and public.is_staff());
drop policy if exists "khtnso staff delete" on storage.objects;
create policy "khtnso staff delete" on storage.objects for delete to authenticated
using(bucket_id='khtnso-resources' and public.is_staff());
drop policy if exists "khtnso published read" on storage.objects;
create policy "khtnso published read" on storage.objects for select to anon,authenticated
using(bucket_id='khtnso-resources' and (public.is_staff() or exists(
  select 1 from public.resources r where r.storage_path=storage.objects.name and r.status='published'
)));

-- Kiểm tra cấu hình sau khi chạy.
select id,name,public,file_size_limit from storage.buckets where id='khtnso-resources';
select policyname,tablename,cmd from pg_policies where schemaname='public' and tablename in ('profiles','resources') order by tablename,policyname;
