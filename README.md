# Bản vá bổ sung: Chọn câu hỏi từ ngân hàng đề trong CMS · Game

## Phạm vi
- Chỉ thay đổi `src/app/admin/game/page.tsx`.
- Thêm nút **“＋ Chọn câu hỏi từ ngân hàng đề”** và hộp thoại chọn câu.
- Hộp thoại hỗ trợ tìm kiếm, chọn nhiều câu, chọn tất cả kết quả, bỏ chọn, thêm câu đã chọn vào vòng.
- Giữ nguyên quy trình tạo/xuất bản vòng, cách lưu `question_ids`, danh sách vòng hiện có và bộ chọn câu hỏi trực tiếp trên trang.
- Dùng danh sách câu đã xuất bản hiện trang đã tải từ `question_bank`, theo môn và độ khó hiện chọn.
- Không thêm bảng SQL, không sửa schema/RLS, không thay đổi biến môi trường, không tạo website mới.

## Cập nhật vào nhánh `main`
1. Tải ZIP bản vá và giải nén.
2. Trong GitHub, mở repository hiện tại và chuyển sang nhánh `main`.
3. Mở đúng đường dẫn `src/app/admin/game/page.tsx`.
4. Chọn **Edit** và thay nội dung file bằng file cùng đường dẫn trong bản vá; hoặc tải file mới lên đúng đường dẫn qua giao diện GitHub.
5. Commit trực tiếp vào `main` (hoặc tạo PR nếu repository bắt buộc review).
6. Chờ Vercel tự deploy; kiểm tra `/admin/game`, đăng nhập tài khoản có quyền admin/teacher, chọn môn/độ khó rồi nhấn nút mới.

## Kiểm tra
- Đã chạy `scripts/check-syntax.cjs`: 71 tệp, 0 lỗi cú pháp.
- Chưa chạy build Next.js hoặc xác nhận deploy trực tiếp trên Vercel trong môi trường này.
