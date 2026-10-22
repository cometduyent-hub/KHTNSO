# KHTN SỐ – sửa liên kết Ngân hàng câu hỏi → CMS Game

## Tệp trong gói
- `src/app/admin/game/page.tsx` — thay đúng tệp này trên nhánh `main`.

## Sửa lỗi
- Không chỉ truy vấn `status = 'published'` ngay trên Supabase; tải các bản ghi mà tài khoản có quyền đọc, sau đó nhận diện các trạng thái công khai/xuất bản thông dụng (`published`, `public`, `active`, `visible`, cờ `is_public`/`published`).
- Chuẩn hóa loại câu hỏi tương đương MCQ, TF, SHORT.
- Chuẩn hóa mã môn để nhận diện các mã như `KHTN7`, `MATH_7`, `ENGLISH` và fallback theo nội dung cho câu cũ chưa có mã môn.
- Không thay đổi bảng, cột, RPC chấm đáp án hoặc trang chơi `/game`.
- Vẫn chỉ đưa câu công khai/đã xuất bản và các loại MCQ/TF/SHORT vào danh sách chọn; không hiển thị câu nháp.

## Cập nhật trực tiếp trên GitHub `main`
1. Tải ZIP và giải nén.
2. Mở repository hiện tại, chọn `main`.
3. Mở `src/app/admin/game/page.tsx`, thay nội dung bằng tệp trong gói.
4. Commit vào `main`, chờ Vercel deploy.
5. Mở `/admin/game`, tải lại và thử chọn cuộc leo núi `KHTN` hoặc `Tổng hợp`.

## Nếu danh sách vẫn trống
Nếu Supabase trả lỗi RLS/quyền đọc hoặc trạng thái công khai được lưu ở một trường riêng chưa được nhận diện, giao diện sẽ hiện thông báo lỗi truy vấn. Khi đó cần xem lỗi và một bản ghi mẫu (ẩn đáp án nếu chia sẻ công khai); không nên mở rộng quyền RLS hoặc thay schema một cách mù quáng.

## Kiểm thử
Gói chỉ gồm tệp cập nhật và hướng dẫn. Chưa chạy build toàn bộ repository hoặc xác minh trên dự án Supabase/Vercel đang triển khai.
