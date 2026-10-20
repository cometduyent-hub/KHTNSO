# KHTN SỐ — sửa lỗi Game V11 và lộ trình nâng cấp

## Lỗi đang gặp
Thông báo `Could not find the table 'public.game_levels' in the schema cache` cho biết bảng mà trang `/game` truy vấn chưa tồn tại trong Supabase đang kết nối, hoặc PostgREST chưa cập nhật schema cache. Đây không phải lỗi chỉ sửa bằng giao diện Next.js.

## Cách sửa an toàn
1. Sao lưu Supabase trước khi thay đổi.
2. Mở Supabase đúng project đang được Vercel sử dụng → SQL Editor → New query.
3. Mở và chạy toàn bộ `supabase/migrations/20261020_game_v11_repair.sql`.
4. Kiểm tra `game_levels`, `game_challenges`, `game_attempts`, `student_wallets`, `diamond_transactions` trong Table Editor.
5. Nếu bảng đã có nhưng lỗi schema cache còn tồn tại, chờ một lúc rồi tải lại trang; trong SQL Editor có thể chạy `NOTIFY pgrst, 'reload schema';`.
6. Mở `/admin/game`, tạo một thử thách, chọn câu hỏi đã xuất bản rồi kiểm tra ở `/game` bằng tài khoản học sinh thử nghiệm.

Migration chỉ dùng `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, chính sách RLS và `ON CONFLICT DO NOTHING`; không xóa/đổi tên bảng hoặc ghi đè nội dung các cấp độ đã chỉnh sửa. Tuy vậy, luôn sao lưu trước khi chạy SQL.

## Lưu ý bảo mật và kiểm thử
- Bảng `game_levels` có dữ liệu cấp độ ban đầu; migration không tự tạo 150 câu/chặng vì câu hỏi phải do giáo viên chọn từ ngân hàng đã duyệt.
- RPC `get_game_challenge` chỉ trả nội dung câu hỏi và phương án, không trả đáp án.
- RPC chấm điểm chỉ hỗ trợ MCQ, TF và SHORT trong game hiện tại; tự luận cần quy trình chấm riêng.
- Chưa triển khai hộp quà bí ẩn, phần thưởng theo thứ hạng về đích, cấu hình đa môn đầy đủ và bảng vinh danh cuối năm trong bản sửa lỗi này.

## Lộ trình còn lại (không tạo website mới)
1. Chuẩn hóa chương trình dùng chung: môn → lớp → bộ sách → chương → bài; liên kết thư viện, ngân hàng câu hỏi và KHBD bằng ID ổn định.
2. Hoàn thiện ngân hàng câu hỏi: 4 mẫu Excel (MCQ/TF/SHORT/ESSAY), media upload qua Storage, câu TF có 4 ý và quy tắc điểm được lưu theo phiên bản đề.
3. Ma trận động: số chủ đề không giới hạn cố định; chủ đề/bài học/mức độ/dạng câu là cấu hình riêng mỗi kỳ thi. Bộ tạo đề phải báo thiếu câu và chặn xuất bản nếu ma trận không khớp.
4. AI Teacher: mẫu KHBD và Phụ lục 1 quản trị được; truy xuất học liệu đã phân loại; trình soạn thảo hỗ trợ hình ảnh/video và xuất Word.
5. Game đa môn: thêm `subject_code` trong `game_challenges.config`, lọc theo môn/lớp/bài; CMS cấu hình chặng, quà, mốc kim cương và mùa giải; mọi trao thưởng ghi ledger và chống nhận trùng.
6. Kiểm thử hồi quy: đăng nhập/role, RLS, tạo và làm đề, chấm điểm, game RPC, ví kim cương, upload media, xuất file; deploy staging trước production.

## Nguyên tắc
Không đổi framework, không thay biến môi trường, không xóa dữ liệu cũ. Những phần còn lại trong lộ trình cần triển khai theo từng migration tăng dần và kiểm thử với schema thực tế trước khi coi là hoàn tất.
