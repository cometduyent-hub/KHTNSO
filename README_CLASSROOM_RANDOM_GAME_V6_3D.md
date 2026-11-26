# KHTN SỐ – Classroom Random Games V6: 3D Projector Experience

## Mục tiêu
Nâng cấp màn hình máy chiếu thành sân khấu khởi động lớp học có màu sắc tươi sáng, chiều sâu không gian và hoạt cảnh phản hồi theo đúng dữ liệu do máy giáo viên điều khiển.

## Tệp cập nhật
- `src/components/game-studio/ProjectorScreen.tsx`
- `src/components/game-studio/ClassroomRandomGames.tsx`

## Điểm nâng cấp
- Sân khấu trình chiếu có nền vũ trụ nhiều lớp sao, tinh vân, sàn lưới phối cảnh, khung sáng và bảng kết quả nổi.
- Vòng quay có vành nổi, ánh sáng, bệ đỡ, tên học sinh theo từng lát; tiếp tục sử dụng góc quay đồng bộ từ máy giáo viên để kim chỉ đúng người được chọn.
- Hộp quà và ô cửa có khối màu, mặt nổi, bóng đổ và hoạt ảnh bật mở.
- Đường đua có nền trời, làn đường, vạch đích, tên gắn trên xe; xe thắng có thời gian hoạt ảnh ngắn hơn, các xe khác vẫn chạy đến hết hoạt cảnh trước khi kết quả được công bố.
- Không gian bí ẩn hiển thị tối đa 20 hành tinh gắn tên học sinh; mỗi hành tinh có quỹ đạo chuyển động đa hướng với độ lệch riêng. Khi kết thúc, chuyển động dừng và hành tinh được chọn phóng lớn ở trung tâm.
- Phiếu bốc thăm được rải trên sân khấu theo vị trí khác nhau; bảng ghép đội có hiệu ứng chiều sâu.
- Giữ đồng bộ giữa máy giáo viên và màn chiếu bằng `BroadcastChannel` và `localStorage`, giữ nhạc nền Web Audio cần bật thủ công trên màn chiếu.

## Cách cập nhật
1. Giải nén bản vá vào thư mục gốc dự án, giữ nguyên cấu trúc `src/...`.
2. Commit và push lên nhánh `main`.
3. Chờ Vercel triển khai.
4. Mở lại `/game-studio`, sau đó mở `/game-studio/projector` trong cửa sổ mới và tải cứng `Ctrl + F5`.
5. Bật nhạc một lần trên cửa sổ trình chiếu. Thử lần lượt vòng quay, đường đua và không gian bí ẩn.

## Giới hạn kiểm thử
- Không thay đổi SQL, Supabase schema/RLS hoặc biến môi trường.
- Hai cửa sổ cần cùng trình duyệt và cùng origin; đây không phải đồng bộ giữa hai thiết bị độc lập.
- Chưa chạy `next build` hoặc kiểm thử trình duyệt/máy chiếu thực tế trong môi trường đóng gói.
