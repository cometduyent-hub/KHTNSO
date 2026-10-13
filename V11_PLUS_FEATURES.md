# KHTN SỐ V11+ — bổ sung ma trận và bản đồ leo núi

## Giữ nguyên cấu trúc
- Next.js 14 App Router, React 18, TypeScript.
- Giữ nguyên các route, Supabase client, schema và migration hiện có.
- Không thêm package mới; không chứa khóa bí mật.

## Bổ sung
### CMS → Tạo đề (`/admin/exam-builder`)
- Bổ sung trình lập ma trận/đặc tả cho 10 chủ đề người dùng yêu cầu.
- Các cột Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao; mỗi mức có TL/TN.
- Nhập số câu theo từng ô; tự tính tổng TL/TN theo chủ đề và toàn ma trận.
- Điểm theo chủ đề có thể nhập/chỉnh riêng để phù hợp quy ước chấm của giáo viên.
- Xuất CSV UTF-8 mở bằng Excel, in/lưu PDF qua hộp thoại trình duyệt.
- Ngân hàng câu hỏi có ô tìm kiếm, lọc dạng câu, chọn tất cả kết quả và bỏ chọn.

### Chinh phục đỉnh Bạch Mã (`/game`)
- Mở rộng khung nội dung toàn chiều ngang và chiều cao màn hình.
- Bổ sung bản đồ núi minh họa, đường leo, 5 cấp độ, số chặng đã xuất bản và các trạm nghỉ mỗi 6 chặng.
- Tận dụng dữ liệu game/Supabase sẵn có; không tự tạo dữ liệu giả hoặc thay đổi cơ chế chấm điểm.

## Ghi chú
- Ma trận là dữ liệu phía giao diện và xuất CSV; chưa ghi vào bảng Supabase vì schema V11 không có bảng ma trận được xác nhận.
- Các tính năng upload tài nguyên/game và CMS vẫn dựa vào cấu hình Supabase, quyền RLS, bucket và schema hiện có.
- Đã chạy `node scripts/check-syntax.cjs`: 64 tệp, 0 lỗi cú pháp. Chưa tuyên bố build/deploy thực tế thành công; cần chạy `npm install` và `npm run build` trong môi trường triển khai.
