# Nâng cấp PHÒNG QUAY SỐ MAY MẮN – V2

## File cập nhật
- `src/app/game-studio/page.tsx`: 5 trò chơi, nhập Excel/CSV, chọn lớp từ Supabase, chọn câu hỏi công khai, tạo phòng trực tiếp, QR, chấm câu trả lời và bảng điểm tạm thời.
- `src/app/game-studio/join/[code]/page.tsx`: giao diện học sinh tham gia bằng mã/QR.

## Cài đặt và triển khai
1. Giải nén patch vào repository hiện tại, giữ nguyên cấu trúc.
2. Không cần thêm package; dự án đã có `xlsx` và `@supabase/supabase-js`.
3. Commit/push lên nhánh `main`; Vercel dùng cấu hình môi trường hiện tại.
4. Trong Supabase Dashboard, bật Realtime cho Broadcast/Realtime Channels. Phòng dùng Broadcast channel tên `khtn-classroom-<MÃ>`.
5. Giáo viên đăng nhập bằng tài khoản có role `teacher` hoặc `admin`; danh sách lớp lấy từ `classes` + `class_members` + `profiles`.

## Cách dùng
- Chọn lớp có sẵn hoặc tải `.xlsx`, `.xls`, `.csv` (cột `Họ và tên`/`Họ tên`/`name`; mã học sinh tùy chọn).
- Có thể dán danh sách nhiều dòng.
- Chọn 1 trong 5 trò: Vòng quay, Hộp quà, Bốc thăm, Ghép đội, Ô cửa bí mật.
- Chọn khối/môn/mã bài để lọc ngân hàng câu hỏi; chỉ câu hỏi có trạng thái công khai/đã xuất bản mới được đưa vào danh sách.
- Chọn câu hỏi, tạo phòng, chiếu QR hoặc mã. Học sinh mở `/game-studio/join/MAPHONG`, nhập tên rồi gửi câu trả lời.

## Giới hạn cần biết
- Broadcast là realtime theo phiên đang mở, không lưu bền vững lịch sử trận đấu.
- Với câu MCQ, khóa đáp án trong `question_bank.answer` cần thống nhất là mã lựa chọn (A/B/C/D) để chấm tự động chính xác. TF/SHORT hiện so sánh chuỗi đáp án chuẩn; các dạng đáp án JSON phức tạp cần chuẩn hóa tiếp.
- QR dùng dịch vụ tạo mã QR bên ngoài; link tham gia vẫn có thể sao chép nếu mạng chặn ảnh QR.
- Phòng này không tự động thay đổi dữ liệu ngân hàng câu hỏi hoặc cấu trúc Supabase.
