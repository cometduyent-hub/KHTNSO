# KHTN SỐ V9 — AI LEARNING PATH

V9 phát triển trực tiếp từ V8 và giữ nguyên các phòng/luồng V2–V8.

## Added
- AI Learning Path nối adaptive plan với curriculum/resources.
- Mỗi ngày có mục tiêu, lý do, checklist và học liệu liên quan.
- Theo dõi hoàn thành từng bước và trạng thái path.
- Bảng `ai_learning_paths`.
- API `/api/ai/student/path` và `/api/ai/student/path/progress`.
- AI chỉ được phép ưu tiên resource id có trong dữ liệu, không bịa tên tài liệu.
- Giữ nguyên AI Tutor, AI Teacher, AI Student, exam runtime và Review.

## Validation
- Cần chạy transpile TypeScript và kiểm tra ZIP.
- Chưa xác nhận npm run build vì môi trường chưa có node_modules đầy đủ.
- Cần chạy SQL V9 trên Supabase thực tế trước production.
