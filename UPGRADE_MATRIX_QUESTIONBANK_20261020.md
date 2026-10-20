# KHTN SỐ – Nâng cấp ma trận động và ngân hàng câu hỏi

## Mục tiêu
Bản cập nhật này giữ nguyên Next.js/Supabase, các trang hiện có, tên biến môi trường và các bảng hiện có. Chỉ bổ sung một bảng mới để lưu mẫu ma trận; không xóa/đổi tên bảng cũ.

## Thay đổi trong mã nguồn
- `src/app/admin/exam-builder/page.tsx`
  - Bỏ danh sách 10 chủ đề cố định.
  - Thêm/sửa tên chủ đề, phạm vi bài học, xóa và nhân bản dòng.
  - Ma trận có số dòng linh hoạt, tự tính tổng số câu theo từng mức độ/hình thức.
  - Nhập/xuất ma trận XLSX; lưu nháp cục bộ và lưu/tải mẫu trên Supabase.
  - Có nút đề xuất chọn câu theo metadata của ngân hàng. Quy trình này chỉ chọn câu có thông tin chủ đề/mức độ/bài học tương ứng; nếu thiếu thì báo thiếu, không tự lấp bằng câu ngẫu nhiên.
- `src/app/admin/exams/page.tsx`
  - Mẫu Excel có các sheet MCQ, TF, SHORT, ESSAY.
  - Mẫu TF có bốn trường ý riêng.
  - Form câu hỏi TF có chỗ nhập nội dung 4 ý và chọn đáp án từng ý.
  - Bổ sung metadata `topic`, `level`, `tf_scoring` để hỗ trợ lọc theo ma trận.

## SQL cần chạy một lần
Chạy file `supabase/migrations/20261020_exam_matrix_templates.sql` trong Supabase SQL Editor. Đây là migration bổ sung bảng `exam_matrix_templates` và RLS theo người dùng; không thay đổi bảng cũ.

## Quy tắc phân loại câu hỏi để tự chọn đúng
Mỗi câu hỏi nên có:
- `lesson_id` gắn đúng bài trong `curriculum`;
- `metadata.topic` khớp tên chủ đề ma trận;
- `metadata.level` là một trong: `Nhận biết`, `Thông hiểu`, `Vận dụng`, `Vận dụng cao`;
- `metadata.lesson_title` hoặc `metadata.lesson` nếu muốn lọc rõ phạm vi bài.

Nếu câu hỏi thiếu metadata, hãy bổ sung trong Ngân hàng câu hỏi hoặc xuất Excel, điền cột `topic`, `level`, `lesson_label`, rồi nhập lại sau khi rà soát. Không nên coi việc tìm từ trong nội dung câu hỏi là phân loại chắc chắn.

## Giới hạn cần biết
- Tự chọn câu theo ma trận hiện dựa vào metadata đã khai báo và nội dung/từ khóa; đây chưa phải bộ phân loại ngữ nghĩa tự động. Cần rà soát trước khi xuất bản đề.
- `tf_scoring` được lưu trong metadata để cấu hình nghiệp vụ, nhưng chưa được nối đồng bộ vào tất cả các bộ chấm hiện hữu. Không sử dụng lựa chọn này làm căn cứ chấm thi thật cho đến khi bộ chấm phía server được cập nhật và kiểm thử.
- Bản này chưa triển khai toàn bộ các hạng mục lớn khác như thư viện đủ dữ liệu đa môn, phần thưởng/hộp quà Chinh phục, theo dõi xem hết video, upload media trực tiếp, hoặc tích hợp hoàn chỉnh Phụ lục 1 vào AI Teacher. Những phần đó cần các đợt cập nhật riêng và kiểm thử trên schema thực tế.

## Triển khai an toàn
1. Sao lưu mã nguồn và cơ sở dữ liệu.
2. Chạy SQL migration trên Supabase.
3. Cập nhật mã nguồn lên GitHub và chờ Vercel deploy.
4. Đăng nhập, vào `/admin/exams` thử mẫu Excel bốn dạng; tạo thử câu TF có 4 ý.
5. Vào `/admin/exam-builder`, thêm 3 hoặc 12 chủ đề, lưu Cloud, tải lại và kiểm tra dữ liệu.
6. Tạo đề nháp trước; chưa công khai cho học sinh cho đến khi kiểm thử việc chấm điểm và chọn câu.

## Kiểm tra đã thực hiện
- `node scripts/check-syntax.cjs`: 66 tệp, 0 lỗi cú pháp transpilation.
- Đã kiểm tra ZIP sau khi đóng gói.
- Chưa chạy `npm run build` hoặc kiểm thử end-to-end với Supabase production trong môi trường này (không có `node_modules` và không có quyền truy cập project Supabase thực tế).
