# KHTN SỐ V5 – trạng thái triển khai

## Đã thực hiện trên nền V4
- Giữ nguyên các route/phòng V4.
- Sửa login để đọc role từ `profiles` trước khi dùng metadata.
- Thay API submit demo bằng luồng thi thật hiện có và harden RPC submit ở server với open/close window.
- Bổ sung AI Core server-side dùng OpenAI Responses API.
- AI Tutor + lưu hội thoại/AI messages.
- AI Teacher.
- AI Question.
- AI Exam/Matrix.
- AI Analyze.
- AI Document ingestion + embeddings.
- Knowledge Base + pgvector + semantic retrieval RPC.
- AI usage logs + student learning profile + learning events.
- API key chỉ dùng ở server env.

## Chưa thể xác nhận trong môi trường hiện tại
- `npm install` timeout do môi trường không hoàn tất tải dependency.
- Vì chưa có `node_modules`, chưa thể tuyên bố `npm run build` đã PASS.
- Chưa kết nối trực tiếp Supabase project thật nên chưa thể xác nhận SQL đã chạy thành công trên project của người dùng.

## Cách xác nhận cuối cùng trên GitHub/Vercel
1. Chạy toàn bộ `supabase/schema.sql`.
2. Cấu hình `.env.local`/Vercel: Supabase URL + anon key + `OPENAI_API_KEY` + model/embedding model.
3. `npm install`.
4. `npm run build`.
5. Đăng nhập học sinh → `/ai` và giáo viên → `/ai/teacher`.
