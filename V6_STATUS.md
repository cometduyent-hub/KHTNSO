# KHTN SỐ V6 – AI Teacher Studio

V6 được xây trực tiếp trên V5, giữ các phòng/route V4-V5 và bổ sung lớp AI Teacher.

## V6 đã thêm
- AI Teacher Studio tại `/ai/teacher`.
- Soạn KHBD, thiết kế hoạt động/STEM, kiểm định câu hỏi.
- Sinh bộ câu hỏi 1–20 câu và đưa trực tiếp vào ngân hàng ở trạng thái Nháp.
- Sinh ma trận đề có cấu trúc JSON.
- Sinh cấu trúc đề/blueprint.
- RAG theo bài học cho AI Teacher và AI Question khi có `lesson_id`.
- Lưu dự án AI Teacher vào `ai_teacher_projects`.
- Gắn nguồn AI vào `question_bank.ai_source_project_id` khi có project id (được chuẩn bị trong schema).
- Chuẩn hóa parse JSON AI và giới hạn số câu sinh mỗi lần.
- Giữ AI Tutor/RAG/usage logs/learning events của V5.

## SQL
Chạy toàn bộ `supabase/schema.sql`; phần V6 nằm cuối file.

## Kiểm thử
- Archive source: kiểm tra được bằng `unzip -t`.
- TypeScript/build: cần cài dependency (`npm install`) và chạy `npm run build` trên máy/Vercel; môi trường phát triển ChatGPT có thể timeout khi tải npm.
