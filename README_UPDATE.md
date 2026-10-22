# KHTN SỐ V18 – Nút chọn đề từ ngân hàng đề

## Tệp cần cập nhật trên nhánh chính
- Thay thế duy nhất: `src/app/admin/exam-builder/page.tsx`

Không xóa hoặc thay thế thư mục `src/app/admin/` và không thay đổi các tệp khác.
Không cần migration SQL cho thay đổi này.

## Cách dùng
1. Sao lưu nhánh chính.
2. Tải tệp `src/app/admin/exam-builder/page.tsx` trong ZIP lên đúng đường dẫn trên GitHub và thay toàn bộ nội dung tệp cũ.
3. Commit lên nhánh chính, chờ Vercel deploy.
4. Mở trang `Tạo đề · V4`. Phần **Chọn đề từ ngân hàng đề** nằm ngay phía trên phần nhập tên đề.
5. Chọn đề đã lưu, nhấn **Nạp câu hỏi từ đề đã chọn**. Câu hỏi của đề được thêm vào danh sách câu đã chọn để tạo một đề mới; đề gốc không bị chỉnh sửa.

## Cách hoạt động và giới hạn
- Danh sách đề lấy từ bảng `exams` hiện có.
- Câu hỏi lấy qua bảng `exam_questions` theo `exam_id`, sắp xếp theo `position`.
- Các câu được cộng vào danh sách đang chọn (không tự xóa câu đã chọn trước đó).
- Không thêm bảng, không đổi schema, không sửa biến môi trường.
- Người dùng phải có quyền Supabase hiện tại để đọc `exams`, `exam_questions` và `question_bank`.
- Nếu một đề cũ không sử dụng `exam_questions` để liên kết câu hỏi, nút sẽ báo rằng đề chưa có câu hỏi trong bảng này; không tự suy đoán dữ liệu khác.
