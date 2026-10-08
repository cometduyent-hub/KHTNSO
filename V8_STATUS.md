# KHTN SỐ V8 — Adaptive Learning Engine

V8 phát triển trực tiếp từ V7 và giữ nguyên các phòng/luồng V2–V7.

## Added
- AI Student dashboard nâng cấp thành Adaptive Learning.
- Tính mastery theo bài học từ các exam_attempts đã submitted.
- Phân loại mức độ: yếu (<50%), cần củng cố (50–79%), đã vững (>=80%).
- Tạo lộ trình 7 ngày và lưu vào `adaptive_learning_plans`.
- Bản đồ năng lực theo bài học.
- Bài luyện cá nhân hóa có thể làm trực tiếp tại `/ai/student/practice/[id]`.
- Chấm bài luyện và ghi `learning_events`.
- `submit_exam` tiếp tục chấm như V7 và ghi thêm event `exam_completed`.
- Giữ AI key server-side.

## Validation
- Đã kiểm tra cú pháp các file V8 bằng TypeScript transpile.
- ZIP archive sẽ được kiểm tra bằng `unzip -t`.
- Chưa xác nhận `npm run build` vì môi trường hiện tại chưa có `node_modules` và `npm install` trước đó bị timeout.
- SQL V8 cần được chạy trên Supabase thực tế trước khi dùng production.
