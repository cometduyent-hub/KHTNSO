# KHTN SỐ V10 — AI MASTER TEACHER

V10 phát triển trực tiếp từ V9, giữ nguyên các phòng và luồng V2–V9.

## Added
- Dashboard `/ai/teacher/master` cho giáo viên.
- Phân tích học sinh trong lớp dựa trên `profiles`, `exam_attempts`, `exam_questions`, `question_bank`, `curriculum`.
- Bản đồ mastery theo bài học.
- Nhóm học sinh: cần hỗ trợ ngay / cần củng cố / có thể nâng cao.
- AI recommendations có căn cứ từ dữ liệu lớp.
- Tạo kế hoạch can thiệp và lưu vào `teacher_interventions`.
- Lưu báo cáo vào `teacher_master_reports`.
- Menu AI Master Teacher.

## Security
- API staff-only.
- AI server-side; không đưa OPENAI_API_KEY vào client.
- RLS cho báo cáo và kế hoạch can thiệp.

## Validation
- Cần transpile TypeScript và kiểm tra ZIP.
- Chưa xác nhận npm run build vì node_modules chưa được cài đầy đủ.
- Cần chạy SQL V10 trên Supabase thực tế.
