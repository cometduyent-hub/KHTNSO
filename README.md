# KHTN SỐ – V5

Nền tảng **KHTN SỐ – Nền tảng Học tập & Thực hành 3D**. V5 giữ các phòng và Exam Engine V4, đồng thời bổ sung AI Core và Knowledge Base/RAG.

## V5
- AI Tutor: `/ai`
- AI Teacher: `/ai/teacher`
- Server API: `/api/ai/tutor`, `/teacher`, `/question`, `/exam`, `/analyze`, `/document`
- Knowledge Base + pgvector
- AI conversation/usage/learning tables
- OpenAI API key chỉ ở biến môi trường server, không dùng `NEXT_PUBLIC_`.
- Exam submit được kiểm tra lại cửa sổ mở/đóng ở server.

## Cài đặt
1. Tạo Supabase project.
2. Chạy toàn bộ `supabase/schema.sql`.
3. Cấu hình `.env.local` từ `.env.example`.
4. `npm install` rồi `npm run build`.
5. Deploy Vercel và khai báo cùng biến môi trường.

## Biến AI
`OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_EMBEDDING_MODEL`, `OPENAI_MAX_OUTPUT_TOKENS`.

> Lưu ý: AI chỉ là trợ lý. Giáo viên vẫn chịu trách nhiệm kiểm tra nội dung trước khi sử dụng trong dạy học/đánh giá.
