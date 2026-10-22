# KHTN SỐ V16 — Audit và nâng cấp bổ sung

## Nguyên tắc
- Tiếp tục trên repository hiện có; không tạo Next.js app, Supabase project hay Vercel project mới.
- Không xóa/đổi tên bảng hiện có.
- Giữ Next.js 14 / React 18 và biến môi trường.

## Những sửa đổi trong gói
1. Thư viện: thêm bộ chọn môn học và bộ sách. Khi không có cây chương trình đã xuất bản cho môn được chọn, hiển thị cảnh báo rõ ràng thay vì hiển thị nhầm cây KHTN. Đã bổ sung migration `subject_code`, `book_code` theo kiểu additive.
2. Ngân hàng câu hỏi: mỗi ý của câu Đúng/Sai có ô nhập phát biểu riêng và lựa chọn đáp án Đúng/Sai tương ứng. Dữ liệu bốn phát biểu được lưu trong `question_bank.options` (JSONB hiện có), không cần thêm bảng.
3. Mẫu Excel ngân hàng: có đủ bốn loại `mcq`, `tf`, `short`, `essay`; mẫu Đúng/Sai có bốn cột phát biểu riêng.
4. Tạo đề V4: giữ luồng hiện tại chọn câu hỏi từ `question_bank`, kiểm tra ma trận và tạo `exam_questions`; không thay cấu trúc bảng đề.
5. Bổ sung tài liệu audit để phân biệt chức năng đã có, phần dữ liệu còn thiếu và cách deploy.

## Việc bắt buộc sau khi deploy
1. Sao lưu GitHub và Supabase.
2. Chạy `supabase/migrations/20261022_v16_multisubject_curriculum.sql` trong SQL Editor của đúng project Supabase.
3. Push thay đổi lên repository đang dùng; giữ nguyên env vars; chờ Vercel build.
4. Kiểm tra `/library`, `/admin/exams` (ngân hàng câu hỏi), `/admin/exam-builder`, `/game`, `/admin/game`.

## Giới hạn đã xác định trong audit — không tuyên bố là đã hoàn thiện
- Cây chương trình cho Toán, Ngữ văn, Tiếng Anh, Lịch sử/Địa lí và các môn tách riêng cần dữ liệu chương trình đã xác minh, được nhập và xuất bản trong Supabase. Gói này không tự bịa tên bài học.
- Tạo đề V4 hiện có cơ chế kiểm tra/chọn câu từ ngân hàng, nhưng cần dữ liệu câu hỏi được gắn đúng bài học và metadata mức độ. Cần kiểm thử thực tế theo schema đang dùng trước khi coi là tạo đề tự động hoàn chỉnh.
- Game hiện lưu danh sách `question_ids` cố định cho từng thử thách. Bộ chọn môn đa môn và lọc câu hỏi theo môn cần được hoàn thiện thêm ở CMS và logic chấm điểm/RPC; gói này không tuyên bố đã hoàn thành phần đó.
- Media câu hỏi hiện dùng URL; chưa triển khai tải file trực tiếp lên Supabase Storage.
- Chưa chạy `next build` hoặc kiểm thử production trong môi trường này. Cần kiểm thử staging/deploy preview trước khi sử dụng chính thức.
