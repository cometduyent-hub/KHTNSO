# KHTN SỐ — V11 · Nền tảng học tập & thực hành Khoa học Tự nhiên

Đây là bản nâng cấp trực tiếp trên dự án KHTN SỐ (Next.js 14 + React 18 + Tailwind + Supabase), giữ nguyên các route/phòng học và các luồng V1–V10 hiện có. Không đổi tên sản phẩm và không xóa bảng cũ.

## Những phần đã được bổ sung trong source V11

- **CMS và phân quyền:** xác minh vai trò từ `profiles` (không tin `user_metadata` để nâng quyền); CMS kiểm tra tài khoản `admin`/`teacher`; trang người dùng chỉ admin được phân quyền.
- **Kho tài nguyên:** thêm/sửa/xóa, trạng thái nháp/công khai, URL ngoài hoặc upload tệp vào Supabase Storage; lọc học liệu công khai theo khối/loại.
- **Cây chương trình:** CRUD bài học trong bảng `curriculum`, tìm kiếm và lọc.
- **Lớp học:** tạo lớp, quản lý thành viên, đồng bộ tên lớp/khối vào hồ sơ người dùng.
- **Báo cáo:** trang tổng hợp số liệu trực tiếp từ Supabase; trang chấm tự luận với điểm từng câu, nhận xét, tổng điểm và lưu người chấm/thời gian chấm.
- **Review bài thi:** giữ luồng Review cũ; bổ sung điểm khách quan, điểm tự luận, nhận xét giáo viên và liên kết tệp đính kèm.
- **Bài làm tự luận:** nhập văn bản, upload ảnh/PDF/tài liệu/âm thanh/video giới hạn 10 MB, bảng vẽ cảm ứng/chuột và lưu hình vẽ cùng bài nộp.
- **Thực hành đo lường:** nhập N lần đo, tính trung bình, sai số ngẫu nhiên trung bình, ước tính sai số dụng cụ, sai số tương đối; lưu báo cáo Cloud, xuất CSV và in/Lưu PDF từ trình duyệt.
- **Chinh phục:** tạo thử thách theo 5 cấp × 30 vòng từ ngân hàng câu hỏi đã xuất bản; có khóa cấp theo kim cương tích lũy, bộ sưu tập 50 avatar, mua/trang bị avatar và bảng vinh danh ẩn danh; RPC server-side lấy câu hỏi không kèm đáp án, chấm kết quả và cấp kim cương một lần cho mỗi vòng.
- **Chat:** kênh lớp, realtime khi Supabase Realtime bật, báo cáo tin nhắn; nhắn tin riêng có giới hạn người nhận theo lớp và kiểm tra phía server.
- **Phòng Sáng tạo:** Gamma, Canva, Gemini, ChatGPT, GeoGebra, AutoGraph, Tinkercad Circuits, CircuitJS/Falstad, PhET, phyphox, CapCut, Clipchamp, Powtoon, diagrams.net, Excalidraw; có CMS thêm/sửa/ẩn/xóa công cụ.
- **Kiểm duyệt:** hàng đợi báo cáo chat, đổi trạng thái và ẩn tin nhắn.
- **Giao diện:** trang chủ sáng hơn với nền lưới khoa học, hiệu ứng chữ và các thẻ phòng học responsive; có hỗ trợ `prefers-reduced-motion`.
- **Cơ sở dữ liệu:** migration V11 bổ sung lớp học/thành viên, tiến độ bài học, hoạt động và bình luận học liệu, báo cáo thực hành, dự án sáng tạo, game, ví kim cương, avatar, báo cáo chat, tin nhắn riêng, thông báo, cấu hình nền tảng và trang nội dung.

## Cài đặt và triển khai

### 1. Supabase

1. Sao lưu database hiện tại hoặc thử trước trên Supabase staging.
2. Nếu dựng mới, chạy `supabase/schema_full.sql` trong SQL Editor. File này gộp schema nền V1–V10 và migration V11.
3. Nếu database đã có schema V1–V10, **chỉ chạy** `supabase/migrations/20261011_khtnso_v11.sql`.
4. Migration tạo bucket private `khtnso-resources` và `khtnso-submissions` nếu chưa tồn tại; chính sách Storage chỉ cho staff upload học liệu và chỉ cho người dùng đọc tệp bài làm của chính họ, staff được đọc bài nộp để chấm.
5. Trigger tạo hồ sơ mới với vai trò `student`. Không có migration tự cấp admin. Để cấp admin ban đầu, đăng ký/đăng nhập tài khoản chủ dự án trước, xác minh đúng email trong Supabase Auth, rồi chạy câu SQL bootstrap được chú thích cuối migration.
6. Bật Realtime cho `chat_messages` nếu project chưa có publication `supabase_realtime` hoặc nếu muốn kiểm tra cấu hình realtime thủ công.

### 2. Biến môi trường

Sao chép `.env.example` thành `.env.local` khi phát triển, và khai báo các biến tương ứng trong Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (chỉ server, nếu dùng các tính năng AI)
- `OPENAI_MODEL`, `OPENAI_EMBEDDING_MODEL`, `OPENAI_MAX_OUTPUT_TOKENS`

Không đặt `SUPABASE_SERVICE_ROLE_KEY` hoặc khóa bí mật trong biến `NEXT_PUBLIC_*`, trong Git hoặc trong source gửi cho học sinh.

### 3. Chạy / deploy

```bash
npm install
npm run build
npm run start
```

Push source lên GitHub và để Vercel build từ repository. Không cần cài Node trên máy người dùng nếu dùng luồng GitHub → Vercel.

## Các route quan trọng

- `/` — Trang chủ
- `/library` — Thư viện chương trình và học liệu đã xuất bản
- `/practice` — Phòng đo lường và báo cáo
- `/simulations` — Mô phỏng và nguồn chính thức
- `/exams`, `/exam/[id]`, `/exam/[id]/review` — Thi và Review
- `/admin` — CMS
- `/admin/resources`, `/admin/curriculum`, `/admin/classes`, `/admin/creative`, `/admin/moderation`, `/admin/users`, `/admin/exams`, `/admin/exam-builder`, `/admin/grading`, `/admin/analytics`, `/admin/game` — Quản trị
- `/game` — Chinh phục; `/game/avatars` — bộ sưu tập avatar; `/game/leaderboard` — bảng vinh danh
- `/creative` — Phòng Sáng tạo
- `/chat` — Kênh lớp và tin nhắn riêng
- `/ai`, `/ai/student`, `/ai/teacher`, `/ai/teacher/master` — Các phòng AI hiện có

## Điều cần biết trước khi đưa vào sử dụng thật

- Bản V11 này được tạo từ source archive V10 được cung cấp trong cuộc trò chuyện. Các thay đổi source và kiểm tra cú pháp được thực hiện trong môi trường hiện tại; **chưa thể xác nhận `npm run build` thành công** vì `npm install` bị timeout trong môi trường này, và chưa có kết nối đến Supabase/Vercel production để chạy kiểm thử tích hợp.
- Cây chương trình JSON hiện có mới là bản dữ liệu khởi đầu, chưa được đối chiếu đầy đủ từng bài với toàn bộ SGK/SBT Kết nối tri thức lớp 6–12. Không nên coi thư viện đã chứa đủ toàn bộ tài liệu.
- Phòng thực hành hiện có bảng đo số liệu và báo cáo, chưa phải mô hình 3D vật lí hoàn chỉnh bằng Three.js/WebGL cho từng dụng cụ.
- Bài thi, AI, RAG, lộ trình thích ứng và Master Teacher V1–V10 được giữ lại từ source gốc; cần chạy migration và kiểm thử trên project thật, đặc biệt các API AI, bài tự luận và RLS.
- Game chỉ chơi được các vòng mà giáo viên đã tạo và gắn câu hỏi đã xuất bản. Avatar catalog có schema nhưng giao diện sưu tập/mua/đổi avatar chưa hoàn chỉnh.
- Chức năng chống gian lận trên trình duyệt chỉ cung cấp tín hiệu hỗ trợ; không thể đảm bảo ngăn tuyệt đối việc can thiệp ở thiết bị người dùng.

Xem `IMPLEMENTATION_STATUS.md` và `SECURITY.md` trước khi triển khai.
