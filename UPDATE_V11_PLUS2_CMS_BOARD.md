# KHTN SỐ V11+2 — CMS tài nguyên và Bảng tương tác

## Những gì được cập nhật

- Nâng cấp `/admin/resources`: kiểm tra phiên đăng nhập và hồ sơ quyền, thêm/sửa/xóa tài nguyên, liên kết tài nguyên với bài học, tải tệp lên bucket `khtnso-resources`, mở/tải tài nguyên qua signed URL, lọc theo khối/trạng thái, tìm kiếm và xuất CSV mở được bằng Excel.
- Cải thiện thông báo lỗi để phân biệt lỗi đăng nhập, `profiles`, `resources`, RLS và Storage.
- Thêm `/teaching-board`: bảng véc tơ chỉnh góc 0–360°, độ lớn, tên véc tơ, thành phần trục, lưới tọa độ; thư viện công thức Vật lý; ghi chú giảng dạy; xuất sơ đồ SVG và in; liên kết nhanh đến Thư viện, Thực hành 3D, Phòng thí nghiệm và Sáng tạo.
- Thêm đường dẫn Bảng tương tác vào thanh điều hướng và bảng điều khiển CMS.
- Tinh chỉnh trạng thái hover/focus và phong cách giao diện công nghệ sáng màu.
- Giữ nguyên các trang và tính năng hiện có; không thay đổi cấu trúc cơ sở dữ liệu trong bản cập nhật này.

## Triển khai

1. Sao lưu kho mã nguồn và cơ sở dữ liệu trước khi thay thế.
2. Giải nén ZIP, đưa toàn bộ thư mục `KHTNSO-main` lên GitHub (giữ nguyên các tệp hiện có), sau đó deploy lại trên Vercel.
3. Đảm bảo Vercel có `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` ở môi trường Production.
4. Tài khoản sử dụng CMS phải đăng nhập và có `profiles.role` là `admin` hoặc `teacher`, cùng `profiles.active = true`.
5. Để tải tệp, Supabase cần bucket riêng tư `khtnso-resources` (giới hạn 50 MB) và các policy Storage/RLS phù hợp. Có thể tham khảo `supabase/CMS_FIX_V11_PLUS2.sql`; chỉ chạy sau khi sao lưu và xác nhận schema nền đã có.
6. Sau deploy, kiểm tra `/admin/resources` bằng cách thêm một URL trước, rồi mới thử tải tệp. Kiểm tra `/teaching-board` và điều chỉnh véc tơ.

## Kiểm tra trong môi trường tạo gói

- `node scripts/check-syntax.cjs`: đã chạy, 65 tệp TypeScript/TSX không có lỗi cú pháp.
- Chưa xác nhận được `npm run build`: cài dependency bằng `npm install` đã hết thời gian chờ trong môi trường tạo gói, nên cần chạy build sau khi dependency được cài đầy đủ trên máy phát triển hoặc Vercel.

## Bảo mật

Không đưa `service_role` key vào mã nguồn trình duyệt hoặc biến `NEXT_PUBLIC_*`. Không tắt RLS để khắc phục lỗi. Nếu CMS báo lỗi khi ghi dữ liệu, hãy kiểm tra nội dung thông báo và policy thực tế trên Supabase.
