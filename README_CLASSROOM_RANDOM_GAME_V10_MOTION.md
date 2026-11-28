# KHTN SỐ – Phòng trò chơi V10 (chuyển động lá thăm và đua xe)

## Nền mã nguồn
- Dựa trên `KHTNSO_CLASSROOM_RANDOM_GAME_V9_MOTION_FIX_MAIN_UPDATED.zip`.
- Kế thừa bản sửa khởi động màn hình máy chiếu V9.1 tại `src/components/game-studio/ProjectorScreen.tsx`.

## Nội dung cập nhật
1. **Bốc thăm may mắn:** tối đa 18 lá thăm hiển thị trên máy chiếu được tạo quỹ đạo riêng; mỗi lá có độ lệch ngang/dọc, góc xoay, tỷ lệ và thời gian khác nhau. Các lá thăm bay lượn tự do liên tục, không chỉ nhấp nhô tại vị trí cũ.
2. **Đường đua:** tổng thời gian chọn người thắng tăng từ 5,9 giây lên 7,9 giây (thêm 2 giây). Xe chuyển động chậm hơn; đường đua, vệt tốc độ và bánh xe cũng giảm nhịp.
3. **Tạo hồi hộp:** từng xe có các chặng tăng tốc/vượt lên/tụt lại. Xe thắng có cú bứt tốc cuối cùng và về đúng vạch đích; các xe còn lại kết thúc ở phía sau.
4. **Giữ nguyên:** dữ liệu lớp, lịch sử gọi tên, chống gọi trùng, cơ chế chọn người thắng, các trò chơi khác, Supabase, SQL, biến môi trường và cấu hình deploy.

## Tệp thay đổi
- `src/components/game-studio/ProjectorScreen.tsx`
- `src/components/game-studio/ClassroomRandomGames.tsx`

## Kiểm tra
- `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp.
- ZIP integrity đã kiểm tra.
- Chưa chạy `next build` và chưa kiểm thử tương tác trên trình duyệt/máy chiếu thực tế.

## Cập nhật
Giải nén gói patch vào repository hiện tại, giữ đúng đường dẫn; commit/push nhánh `main` để Vercel deploy. Không chạy SQL và không thay đổi Environment Variables.
