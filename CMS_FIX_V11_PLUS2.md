# Sửa lỗi CMS không thêm được tài nguyên trên V11+2

## Vì sao trang Admin có thể hiện nhưng không lưu được?

Trang Admin chỉ là giao diện. CMS cần đồng thời: biến môi trường Supabase hợp lệ, tài khoản đăng nhập, hồ sơ `profiles` có `role` là `admin` hoặc `teacher` và `active=true`, bảng `resources`, bucket Storage `khtnso-resources`, cùng các chính sách RLS/Storage cho phép staff ghi dữ liệu. Nếu thiếu một trong các điều kiện này, nút có thể hiện nhưng thao tác sẽ thất bại.

## 1. Triển khai bản code sửa thông báo lỗi

Giữ nguyên toàn bộ cấu trúc dự án, thay các tệp bằng phiên bản trong ZIP này và deploy lại. Bản này làm rõ lỗi hồ sơ quyền, truy vấn bảng tài nguyên và lỗi lưu bản ghi; không bỏ qua kiểm tra quyền.

## 2. Kiểm tra biến môi trường Vercel

Trong Project Settings → Environment Variables, xác nhận có:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Đặt đúng môi trường Production, sau đó redeploy. Không đưa `service_role` key vào biến `NEXT_PUBLIC_*`.

## 3. Chạy SQL sửa CMS/Storage

1. Sao lưu dữ liệu Supabase trước.
2. Mở Supabase → SQL Editor.
3. Nếu dự án chưa có schema V11, cần chạy schema gốc phù hợp trước; migration này không thay thế toàn bộ schema.
4. Chạy `supabase/CMS_FIX_V11_PLUS2.sql`.

SQL tạo/cập nhật bucket riêng tư `khtnso-resources` và chính sách cho phép nhân sự có quyền tải lên, cập nhật, xóa; người học chỉ đọc tệp gắn với tài nguyên đã công khai.

## 4. Cấp quyền cho tài khoản đúng cách

Đăng nhập một lần bằng tài khoản cần cấp quyền để trigger tạo hồ sơ trong `profiles`. Sau đó mở Supabase → Table Editor → `profiles`, tìm đúng dòng có `id` trùng với `auth.users.id` của tài khoản, xác minh email ở Authentication → Users, rồi đặt:

- `role` = `admin` (quản trị toàn hệ thống) hoặc `teacher` (quản lý học liệu theo quyền dự án)
- `active` = `true`

Không cấp `admin` cho tài khoản chưa xác minh. Sau đó đăng xuất/đăng nhập lại.

Có thể kiểm tra hồ sơ bằng SQL chỉ đọc:

```sql
select p.id, u.email, p.role, p.active
from public.profiles p
join auth.users u on u.id=p.id
order by u.created_at desc;
```

## 5. Kiểm tra sau deploy

- Vào `/admin/resources`.
- Thử thêm tài nguyên bằng URL trước (không cần Storage).
- Công khai và kiểm tra tài nguyên xuất hiện trong thư viện.
- Thử tải lên một PDF nhỏ sau khi URL lưu thành công.

Nếu vẫn lỗi, chụp nguyên thông báo đỏ trong trang CMS và gửi kèm dòng lỗi ở trình duyệt → DevTools → Console. Không gửi anon key, service role key hay mật khẩu.
