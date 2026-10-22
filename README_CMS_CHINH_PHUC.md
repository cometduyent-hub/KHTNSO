# KHTN SỐ — Bản vá CMS Chinh phục đa môn

## Tệp cần cập nhật trên nhánh `main`
- `src/app/admin/game/page.tsx` (thay tệp hiện tại)
- `src/app/game/page.tsx` (thay tệp hiện tại bằng bản trong gói; chỉ bổ sung lọc theo `subject_code` và giữ tương thích vòng cũ)

## Cách cập nhật
1. Giải nén ZIP.
2. Trên GitHub chọn đúng repository và nhánh `main`.
3. Cập nhật đúng hai tệp theo đường dẫn ở trên, giữ nguyên mọi tệp khác.
4. Commit thay đổi, chờ Vercel deploy.
5. Mở `/admin/game`, tạo thử một vòng cho từng môn, sau đó kiểm tra `/game`.

## Cách tạo vòng đúng
1. Trong CMS ngân hàng câu hỏi, tạo câu hỏi, điền đáp án chuẩn, chọn đúng `subject_code` (KHTN, ENGLISH, MATH, LITERATURE) và `difficulty` (easy, hard, advanced hoặc mixed nếu có), rồi đặt `status = published`.
2. Hiện vòng leo núi dùng các dạng `mcq`, `tf`, `short`. Câu tự luận không nằm trong danh sách lựa chọn vì RPC chấm game hiện hỗ trợ ba dạng này.
3. Vào `/admin/game`, chọn cuộc leo núi, cấp độ, vòng, khối lớp, độ khó, thời gian, kim cương; chọn câu hỏi phù hợp và bấm **Tạo và xuất bản vòng**.
4. Vòng mới lưu `subject_code` trực tiếp trên `game_challenges`, không còn phụ thuộc riêng vào từ khóa trong tiêu đề. Màn hình `/game` lọc theo mã môn trước, và chỉ dùng tiêu đề làm phương án tương thích cho vòng cũ chưa có mã môn.

## Bảo toàn dữ liệu và bảo mật
- Không có bảng nào bị xóa/đổi tên; không cần migration mới nếu dự án đã chạy migration V15 bổ sung `subject_code` và `difficulty`.
- Không thay đổi hàm RPC chấm bài. Khóa đáp án vẫn chỉ dùng server-side.
- Không commit `.env` hoặc khóa Supabase vào repository.

## Lưu ý kiểm tra
Gói được tạo từ mã nguồn sẵn có và bản vá V20 trong phiên làm việc. Chưa thể xác nhận build/deploy live. Nếu Supabase báo `subject_code` hoặc `difficulty` không tồn tại trong schema cache, kiểm tra đã chạy migration additive V15 trên đúng project Supabase đang kết nối với Vercel; không chạy schema thay thế hoặc xóa bảng.
