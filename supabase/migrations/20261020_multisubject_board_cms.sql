-- KHTN SỐ: Mở rộng CMS bảng tương tác đa môn, chỉ bổ sung bảng mới.
-- Không đổi tên/xóa bảng cũ, không yêu cầu đổi biến môi trường.
begin;

create table if not exists public.subject_catalog (
  code text primary key,
  name text not null,
  grade_levels integer[] not null default array[6,7,8,9],
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.board_catalog (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('formula','template')),
  subject_code text not null references public.subject_catalog(code) on update cascade,
  grade integer not null default 0 check (grade between 0 and 12),
  title text not null,
  content text not null,
  description text not null default '',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_board_catalog_filter on public.board_catalog(status, subject_code, grade, entry_type, sort_order);

create or replace function public.khtnso_touch_updated_at()
returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists subject_catalog_touch on public.subject_catalog;
create trigger subject_catalog_touch before update on public.subject_catalog for each row execute function public.khtnso_touch_updated_at();
drop trigger if exists board_catalog_touch on public.board_catalog;
create trigger board_catalog_touch before update on public.board_catalog for each row execute function public.khtnso_touch_updated_at();

alter table public.subject_catalog enable row level security;
alter table public.board_catalog enable row level security;

drop policy if exists subject_catalog_read_active on public.subject_catalog;
create policy subject_catalog_read_active on public.subject_catalog for select to authenticated using (active = true or exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));
drop policy if exists subject_catalog_admin_insert on public.subject_catalog;
create policy subject_catalog_admin_insert on public.subject_catalog for insert to authenticated with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));
drop policy if exists subject_catalog_admin_update on public.subject_catalog;
create policy subject_catalog_admin_update on public.subject_catalog for update to authenticated using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true)) with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));
drop policy if exists subject_catalog_admin_delete on public.subject_catalog;
create policy subject_catalog_admin_delete on public.subject_catalog for delete to authenticated using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));

drop policy if exists board_catalog_read_published on public.board_catalog;
create policy board_catalog_read_published on public.board_catalog for select to authenticated using (status='published' or exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));
drop policy if exists board_catalog_admin_insert on public.board_catalog;
create policy board_catalog_admin_insert on public.board_catalog for insert to authenticated with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));
drop policy if exists board_catalog_admin_update on public.board_catalog;
create policy board_catalog_admin_update on public.board_catalog for update to authenticated using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true)) with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));
drop policy if exists board_catalog_admin_delete on public.board_catalog;
create policy board_catalog_admin_delete on public.board_catalog for delete to authenticated using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin' and p.active=true));

insert into public.subject_catalog(code,name,grade_levels,sort_order) values
('NGUVAN','Ngữ văn',array[6,7,8,9],1),('TOAN','Toán',array[6,7,8,9],2),('TIENGANH','Ngoại ngữ 1 – Tiếng Anh',array[6,7,8,9],3),('GDCD','Giáo dục công dân',array[6,7,8,9],4),('LS_DIA','Lịch sử và Địa lí',array[6,7,8,9],5),('KHTN','Khoa học tự nhiên',array[6,7,8,9],6),('CONGNGHE','Công nghệ',array[6,7,8,9],7),('TINHOC','Tin học',array[6,7,8,9],8),('GDTC','Giáo dục thể chất',array[6,7,8,9],9),('AMNHAC','Nghệ thuật – Âm nhạc',array[6,7,8,9],10),('MITHUAT','Nghệ thuật – Mĩ thuật',array[6,7,8,9],11),('HDTN_HN','Hoạt động trải nghiệm, hướng nghiệp',array[6,7,8,9],12),('DIA_PHUONG','Nội dung giáo dục của địa phương',array[6,7,8,9],13)
on conflict(code) do update set name=excluded.name, grade_levels=excluded.grade_levels, sort_order=excluded.sort_order;

insert into public.board_catalog(entry_type,subject_code,grade,title,content,description,status,sort_order) values
('template','NGUVAN',0,'Sơ đồ phân tích văn bản','Tác phẩm: …\nTác giả: …\nChủ đề: …\nNhân vật / hình ảnh tiêu biểu: …\nNghệ thuật: …\nThông điệp: …','Mẫu khung phân tích có thể chèn lên bảng và chỉnh sửa.', 'published',1),
('template','NGUVAN',0,'Khung lập luận','Vấn đề nghị luận: …\nLuận điểm 1: …\nLí lẽ: …\nDẫn chứng: …\nLuận điểm 2: …\nKết luận: …','Khung tổ chức ý, không thay thế yêu cầu cụ thể của đề.', 'published',2),
('template','TOAN',0,'Bảng giải bài toán','Dữ kiện: …\nYêu cầu: …\nKiến thức cần dùng: …\nCác bước giải: …\nKiểm tra kết quả: …','Khung trình bày lời giải.', 'published',1),
('template','TIENGANH',0,'Vocabulary card','Word: …\nPronunciation: …\nPart of speech: …\nMeaning: …\nExample sentence: …','Mẫu thẻ từ vựng tiếng Anh.', 'published',1),
('template','GDCD',0,'Phân tích tình huống','Tình huống: …\nHành vi / vấn đề: …\nQuyền và nghĩa vụ liên quan: …\nCách ứng xử phù hợp: …\nLí do: …','Mẫu phân tích tình huống giáo dục công dân.', 'published',1),
('template','LS_DIA',0,'Dòng thời gian sự kiện','Thời gian: …\nSự kiện: …\nNguyên nhân / bối cảnh: …\nKết quả / ý nghĩa: …','Khung tổ chức sự kiện lịch sử.', 'published',1),
('template','KHTN',0,'Báo cáo thực hành','Mục tiêu: …\nDụng cụ: …\nCách tiến hành: …\nBảng số liệu: …\nNhận xét: …\nKết luận: …','Khung báo cáo thực hành khoa học.', 'published',1),
('template','CONGNGHE',0,'Quy trình thiết kế sản phẩm','Nhu cầu: …\nTiêu chí: …\nÝ tưởng: …\nBản thiết kế: …\nVật liệu / dụng cụ: …\nThử nghiệm và cải tiến: …','Khung thiết kế kỹ thuật.', 'published',1),
('template','TINHOC',0,'Mô tả thuật toán','Bài toán: …\nDữ liệu vào: …\nKết quả ra: …\nCác bước xử lí: …\nKiểm thử: …','Khung phân tích thuật toán.', 'published',1),
('template','GDTC',0,'Theo dõi luyện tập','Nội dung: …\nMục tiêu an toàn: …\nKỹ thuật trọng tâm: …\nKết quả quan sát: …\nTự đánh giá: …','Mẫu theo dõi hoạt động thể chất; điều chỉnh theo hướng dẫn của giáo viên.', 'published',1),
('template','AMNHAC',0,'Phân tích tác phẩm âm nhạc','Tên tác phẩm: …\nNhịp / tốc độ: …\nGiai điệu: …\nSắc thái: …\nCảm nhận: …','Khung trao đổi về tác phẩm âm nhạc.', 'published',1),
('template','MITHUAT',0,'Phân tích bố cục tạo hình','Chủ đề: …\nBố cục: …\nHình khối / đường nét: …\nMàu sắc: …\nThông điệp: …','Khung phân tích sản phẩm mĩ thuật.', 'published',1),
('template','HDTN_HN',0,'Kế hoạch hoạt động nhóm','Mục tiêu: …\nNhiệm vụ: …\nPhân công: …\nThời hạn: …\nMinh chứng: …\nTự đánh giá: …','Mẫu tổ chức hoạt động trải nghiệm.', 'published',1),
('template','DIA_PHUONG',0,'Tìm hiểu địa phương','Chủ đề: …\nĐịa điểm / cộng đồng: …\nNguồn tư liệu: …\nĐiều quan sát được: …\nGiá trị địa phương: …\nNguồn cần kiểm chứng: …','Khung tìm hiểu văn hóa, lịch sử và môi trường địa phương.', 'published',1),
('formula','KHTN',6,'Trọng lượng gần đúng','P = 10 × m','P tính bằng N, m tính bằng kg; dùng gần đúng g ≈ 10 N/kg.', 'published',10),
('formula','KHTN',7,'Tốc độ','v = s / t','v là tốc độ, s là quãng đường, t là thời gian.', 'published',11),
('formula','KHTN',8,'Áp suất','p = F / S','F là áp lực vuông góc với bề mặt, S là diện tích bị ép.', 'published',12),
('formula','TOAN',6,'Chu vi hình chữ nhật','P = 2 × (a + b)','a và b là chiều dài hai cạnh kề.', 'published',1),
('formula','TOAN',6,'Diện tích hình chữ nhật','S = a × b','a và b là chiều dài hai cạnh kề.', 'published',2)
on conflict do nothing;
commit;
