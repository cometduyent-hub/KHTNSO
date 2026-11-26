# KHTN SỐ – Projector V8: Orbit, Race & Wheel Motion

## Phạm vi cập nhật

Bản V8 được xây dựng trên mã nguồn V7, chỉ điều chỉnh `src/components/game-studio/ProjectorScreen.tsx` và không thay đổi logic chọn học sinh, lịch sử, thống kê, dữ liệu Supabase, RLS hoặc biến môi trường.

## Thay đổi

1. **Vòng quay:** dùng Web Animations API để phát hoạt ảnh quay từ góc cũ đến góc đích trong 4,3 giây. Khi kết thúc, góc cuối được ghi vào style để vòng quay dừng chính xác tại lát học sinh đã được chọn. Hiệu ứng phát sáng vẫn hoạt động trong lúc quay.
2. **Không gian bí ẩn:** các hành tinh mang tên học sinh chuyển động trên các quỹ đạo tròn đồng tâm với bán kính, tốc độ, pha ban đầu và chiều quay khác nhau. Tên hành tinh giữ hướng dễ đọc nhờ lớp counter-rotation. Khi giáo viên kết thúc lượt, hoạt ảnh quỹ đạo tạm dừng; hành tinh được chọn phóng lớn ở tâm sân khấu.
3. **Đường đua:** xe chạy trên các làn đường trong phần mặt đường, có vạch đường chuyển động, vệt tốc độ và bánh xe quay. Xe thắng có thời gian ngắn hơn; các xe khác tiếp tục chạy rồi dừng ở vạch đích.

## Cập nhật

- Dùng bản vá: chép `src/components/game-studio/ProjectorScreen.tsx` vào đúng vị trí trong dự án.
- Hoặc dùng toàn bộ ZIP V8 nếu muốn thay thế mã nguồn bằng gói đầy đủ dựa trên V7.
- Không chạy SQL và không thay đổi `.env`.
- Sau khi deploy, đóng cửa sổ trình chiếu cũ, mở lại `/game-studio/projector`, nhấn Ctrl+F5. Cửa sổ điều khiển và trình chiếu phải cùng origin/trình duyệt để đồng bộ qua BroadcastChannel/localStorage.

## Kiểm tra

Đã chạy `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp. Chưa chạy `next build`/kiểm thử trình duyệt thực tế trong môi trường đóng gói.
