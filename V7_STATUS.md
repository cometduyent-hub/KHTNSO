# KHTN SỐ V7 – AI STUDENT

V7 được xây trực tiếp từ V6 và giữ nguyên các route/chức năng V6.

## Chức năng mới
- AI Student Dashboard: `/ai/student`.
- Phân tích tối đa 8 bài thi đã nộp của chính học sinh.
- Đối chiếu câu trả lời với đáp án khách quan trong `question_bank`.
- Gom kết quả theo bài/chủ đề từ `curriculum`.
- AI phát hiện lỗ hổng có bằng chứng, điểm mạnh, hướng học tiếp theo.
- Lưu `student_learning_profile` và `learning_events`.
- Tạo bài luyện cá nhân hóa 3–20 câu từ hồ sơ lỗ hổng.
- Lưu bài luyện vào `personalized_practice_sets`.
- AI Tutor V6 vẫn giữ nguyên.

## Bảo mật
- Student API chỉ đọc `exam_attempts` của `auth.uid()`.
- AI key vẫn chỉ ở server.
- RLS cho `personalized_practice_sets`.

## SQL cần chạy trên Supabase
Chạy toàn bộ `supabase/schema.sql`; phần cuối chứa migration V7.

## Kiểm thử
- Đã kiểm tra cú pháp TypeScript/TSX bằng TypeScript transpile.
- Đã kiểm tra ZIP integrity.
- Chưa xác nhận `npm run build` vì môi trường hiện tại không hoàn tất được `npm install`.
- Chưa kết nối trực tiếp Supabase production của người dùng.
