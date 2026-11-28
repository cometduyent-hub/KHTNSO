# KHTN SỐ – Phòng trò chơi V11

## Nền mã nguồn
- Kế thừa toàn bộ `KHTNSO_CLASSROOM_RANDOM_GAME_V10_MAIN_UPDATED.zip`.
- Chỉ cập nhật giao diện và hoạt ảnh trong hai component phòng trò chơi.

## Nội dung
1. **Đua xe 10 làn:** tăng từ 5 lên tối đa 10 học sinh/xe trong một lượt (thêm 5 làn); vùng đường đua được nới cao và chia đều 10 vị trí. Thời gian từ lúc xuất phát đến lúc công bố kết quả tăng từ 7,9 lên 9,9 giây. Chuyển động xe dùng các chặng tăng tốc, vượt lên, chậm lại và bứt tốc cuối; nội suy mượt hơn, giảm độ giật do thay đổi làn.
2. **Hộp quà bí ẩn:** mỗi hộp có linh vật hoạt hình riêng (gấu, thỏ, gấu trúc, cáo, ếch, mèo, chim cánh cụt, koala), giữ biểu tượng hộp quà và hiệu ứng nổi nhẹ. Đồng bộ ở màn điều khiển và máy chiếu.
3. **Ô cửa bí mật:** mỗi ô có một nhân vật hoạt hình riêng (kỳ lân, hổ, khỉ, gấu Bắc Cực, gấu trúc, thỏ, rồng, ếch, hamster, gà con, sư tử, bạch tuộc), chuyển động nhún nhẹ; khi mở vẫn hiện kết quả học sinh.

## Tệp thay đổi
- `src/components/game-studio/ClassroomRandomGames.tsx`
- `src/components/game-studio/ProjectorScreen.tsx`

## Giữ nguyên
Không sửa SQL/Supabase, biến môi trường, cấu hình Vercel, dữ liệu lớp, lịch sử gọi tên hoặc các trò chơi khác.

## Kiểm tra
- `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp.
- Chưa chạy `next build` hoặc thử trực tiếp trên trình duyệt/máy chiếu.
