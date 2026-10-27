# Bản vá bổ sung – CMS Game / Chinh phục đỉnh Bạch Mã

## File cần cập nhật
- `src/app/admin/game/page.tsx`

Bản vá chỉ thay đổi trang quản lý game hiện có, không tạo website mới, không sửa cấu trúc bảng Supabase, không yêu cầu chạy SQL và không thay đổi biến môi trường.

## Nội dung
- Nạp danh sách `question_bank` theo từng trang, không dừng ở 1.000/2.000 bản ghi đầu.
- Nhận diện câu đã công bố/đã xuất bản qua trường trạng thái thông dụng (`status`, `publication_status`, `visibility`) và các cờ công khai có sẵn nếu có.
- Chuẩn hóa một số cách ghi loại câu và mã môn cũ để giảm trường hợp câu đã xuất bản nhưng không hiện trong bộ chọn.
- Thêm nút **“Chọn từ toàn bộ ngân hàng”** để bỏ lọc môn/độ khó/từ khóa, đưa người dùng về danh sách mọi câu công khai phù hợp loại game.
- Hiển thị tổng số câu công khai đã nạp và thông báo lỗi nếu Supabase không đọc được ngân hàng.
- Giữ nguyên luồng tạo/xóa vòng, quyền admin/giáo viên và cấu trúc lưu `game_challenges` hiện có.

## Cập nhật vào nhánh `main`
1. Tải ZIP và giải nén.
2. Trong repository GitHub đang dùng để deploy, mở `src/app/admin/game/page.tsx`.
3. Thay nội dung file hiện tại bằng file cùng đường dẫn trong gói này. Không thay các file khác.
4. Commit vào nhánh `main`, ví dụ: `Fix game CMS published question bank picker`.
5. Đợi Vercel deploy tự động rồi vào **CMS · Chinh phục đỉnh Bạch Mã** → **Chọn từ toàn bộ ngân hàng**.

## Kiểm tra sau deploy
- Đăng nhập bằng tài khoản có quyền admin/teacher.
- Mở CMS Game và bấm **Tải lại**.
- Bấm **Chọn từ toàn bộ ngân hàng**; danh sách chỉ gồm câu công khai/đã xuất bản thuộc dạng MCQ, Đúng/Sai hoặc trả lời ngắn (các dạng game hiện hỗ trợ).
- Nếu câu vẫn thiếu, kiểm tra `status` thực tế trong `question_bank` và quyền đọc bảng/RLS của tài khoản đang đăng nhập. Bản vá không thể hiển thị dữ liệu mà Supabase không trả về.

## Kiểm tra kỹ thuật
Đã chạy script kiểm tra cú pháp TypeScript/JSX trên snapshot nguồn: không phát hiện lỗi cú pháp. Chưa thực hiện build Next.js hoặc deploy trực tiếp lên GitHub/Vercel của người dùng.
