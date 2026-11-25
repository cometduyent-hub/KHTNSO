# KHTN SỐ – Classroom Random Game V4

## Mục tiêu nâng cấp
Tách giao diện điều khiển giáo viên khỏi giao diện trình chiếu, bổ sung hai trò chơi và thống kê lượt gọi học sinh.

## Chức năng mới
- Nút **Mở màn hình máy chiếu riêng** mở `/game-studio/projector` trong cửa sổ độc lập.
- Cửa sổ máy chiếu chỉ hiển thị hoạt cảnh, tên học sinh, nhiệm vụ và nút bật/tắt nhạc nền; không có điều khiển quản trị.
- Đồng bộ cùng trình duyệt bằng `BroadcastChannel`, có snapshot `localStorage` làm dữ liệu khởi tạo/dự phòng. Hai cửa sổ cần chạy cùng trình duyệt, cùng domain.
- **Gọi học sinh tiếp theo** hoạt động theo trò chơi hiện tại: vòng quay quay tiếp, hộp quà mở hộp chưa mở tiếp theo, ô cửa mở ô chưa mở tiếp theo, các trò còn lại rút tên.
- **Đưa học sinh trở lại danh sách** gỡ lượt gọi hiện tại và trừ lại thống kê tương ứng.
- Chọn nhiệm vụ cố định hoặc để hệ thống chọn ngẫu nhiên; tên và nhiệm vụ được chiếu nổi bật.
- Thống kê tổng số lần gọi theo mã học sinh (nếu có), nếu không có mã thì theo tên; lưu cục bộ trên trình duyệt giáo viên và có xuất Excel.
- Thêm **Đường đua thần tốc** và **Viên nang vũ trụ**.
- Màn chiếu có hoạt ảnh phối cảnh CSS 3D, hiệu ứng tên xuất hiện và nhạc nền giai điệu tổng hợp do trình duyệt phát.

## File thay đổi
- `src/components/game-studio/ClassroomRandomGames.tsx`
- `src/components/game-studio/ProjectorScreen.tsx` (mới)
- `src/app/game-studio/projector/page.tsx` (mới)

## Lưu ý vận hành
1. Chọn lớp trong CMS hoặc nhập danh sách như hiện tại.
2. Mở cửa sổ máy chiếu riêng, kéo cửa sổ sang máy chiếu và nhấn F11.
3. Nhấn **Bật nhạc nền** ngay trên cửa sổ máy chiếu để cấp quyền phát âm thanh.
4. Điều khiển mọi lượt gọi từ cửa sổ giáo viên.
5. Thống kê V4 đang lưu cục bộ trong trình duyệt máy giáo viên (`localStorage`), không tự đồng bộ giữa nhiều máy và có thể mất nếu xóa dữ liệu trang web. Đây là cách triển khai không cần thay đổi schema Supabase hay biến môi trường. Nếu cần thống kê tập trung nhiều giáo viên/máy, cần bổ sung bảng Supabase và migration riêng ở bước tiếp theo.

## Tương thích và kiểm tra
- Không thay đổi bảng Supabase, RLS, biến môi trường, ngân hàng câu hỏi hoặc trang tham gia trận đấu.
- Đã chạy `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp.
- Chưa chạy `next build` / kiểm tra TypeScript đầy đủ do môi trường đóng gói không có `node_modules`. Cần chạy build trong Vercel sau khi cập nhật.
