# KHTN SỐ – Phòng trò chơi V12

## Nội dung cập nhật

1. Đường đua tăng thời gian lựa chọn lên 11,9 giây (V11 là 9,9 giây).
2. Chuyển động xe được sửa theo các mốc tiến về phía trước liên tục. Không còn các keyframe giảm quãng đường giữa chặng gây cảm giác xe chạy lùi. Xe thắng tiến đến vạch đích; các xe còn lại dừng ở phía sau.
3. Bốc thăm: mỗi lá thăm có linh vật riêng (gấu, thỏ, gấu trúc, cáo, ếch, mèo, chim cánh cụt, kỳ lân...) cùng hiệu ứng nhún, lấp lánh và phiếu riêng; tên học sinh vẫn hiển thị trên từng lá.

## File cập nhật

- `src/components/game-studio/ClassroomRandomGames.tsx`
- `src/components/game-studio/ProjectorScreen.tsx`

## Cách cập nhật

Giải nén gói vá và chép đúng hai file trên vào dự án hiện tại, sau đó commit/push lên nhánh `main` để Vercel triển khai.

Không thay đổi schema/SQL Supabase, biến môi trường, cấu hình Vercel hay các phòng khác.

## Kiểm tra

- `node scripts/check-syntax.cjs`: 81 file, 0 lỗi cú pháp.
- Chưa chạy `next build` và chưa kiểm thử trực tiếp trên trình duyệt/màn chiếu.
