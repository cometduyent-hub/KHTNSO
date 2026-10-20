# KHTN SỐ V11 – nâng cấp Ngân hàng câu hỏi

## Chức năng
- Nhập nhiều câu hỏi từ Excel `.xlsx`, `.xls` hoặc CSV.
- Tải file Excel mẫu và xuất toàn bộ ngân hàng/danh sách đang lọc.
- Hỗ trợ `mcq`, `tf`, `short`, `essay`; gắn bài học từ danh mục curriculum nếu cột `lesson_label` khớp tên bài.
- Lưu câu hỏi trong bảng Supabase hiện có `question_bank`; không tạo bảng mới, không đổi cấu trúc bảng hoặc biến môi trường.
- Chỉnh sửa nội dung, phương án, đáp án, điểm, trạng thái, từ khóa, URL hình ảnh/âm thanh/video và gợi ý chấm.
- Câu nhập mới mặc định ở trạng thái `draft` để quản trị viên rà soát trước khi xuất bản.

## Cách sử dụng
1. Triển khai mã nguồn lên GitHub/Vercel như cập nhật thông thường.
2. Vào `/admin/exams`, chọn **Tải file Excel mẫu**.
3. Điền một câu hỏi trên mỗi dòng, giữ nguyên tên các cột mẫu.
4. Nhập `type`: `mcq`, `tf`, `short`, `essay`.
5. MCQ: dùng `option_a` đến `option_d`, `answer` là `A`, `B`, `C` hoặc `D`.
6. TF: cột `answer` gồm bốn giá trị Đúng/Sai ngăn bằng dấu chấm phẩy, ví dụ `Đúng;Sai;Đúng;Sai`.
7. `lesson_label` có thể để trống; nếu nhập tên bài thì hệ thống cố gắng đối chiếu với danh mục curriculum hiện có.
8. `image_url`, `audio_url`, `video_url` nhận URL tư liệu. `status` nên là `draft` để kiểm tra trước khi chuyển sang `published`.
9. Nhấn **Chọn file Excel/CSV để nhập**. Kiểm tra thông báo số câu đã nhập và rà soát lại câu hỏi.

## Lưu ý
- Nhập file tạo thêm bản ghi mới; không tự cập nhật/ghi đè câu hỏi cũ. Tránh nhập lặp cùng một file nhiều lần.
- Tệp media ở bản này được liên kết bằng URL; chưa tải tệp nhị phân trực tiếp lên Storage. Nguồn URL phải cho phép website truy cập và phát media.
- Các câu hỏi được lưu lâu dài trong Supabase hiện có. Quyền truy cập vẫn tuân theo RLS hiện tại của `question_bank`.
- Đã chạy kiểm tra cú pháp TypeScript/JSX bằng `scripts/check-syntax.cjs` (66 tệp, không có lỗi cú pháp). Chưa thể xác nhận build Vercel hoặc kiểm thử tích hợp với dự án Supabase thực tế từ môi trường này.
