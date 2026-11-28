# KHTN SỐ – Bổ sung ứng dụng cho Phòng Khởi động

## Nội dung cập nhật
- Bổ sung 7 liên kết ứng dụng trong `src/app/game-studio/page.tsx`:
  1. Wheel of Names
  2. Flippity
  3. ClassDojo
  4. Wordwall
  5. Classroomscreen
  6. Baamboozle
  7. Mentimeter
- Hiển thị thành khu vực “Ứng dụng hỗ trợ khởi động” ngay dưới hệ thống trò chơi gọi tên hiện có.
- Giữ nguyên component `ClassroomRandomGames`, danh sách học sinh, các trò chơi tích hợp và các phòng hoạt động còn lại.
- Liên kết mở trong thẻ mới. Đây là tích hợp dạng liên kết, chưa nhúng dịch vụ hoặc đồng bộ dữ liệu với Supabase.

## Tệp thay đổi
- `src/app/game-studio/page.tsx`

## Cập nhật lên nhánh main
Sao lưu tệp hiện tại, sau đó thay đúng tệp `src/app/game-studio/page.tsx` bằng tệp trong bản vá. Không thay `.env`, cấu hình Vercel, schema/migration Supabase hoặc các thư mục khác.

## Kiểm tra
Đã chạy `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp. Chưa chạy `npm run build` hoặc kiểm thử trình duyệt trong phiên này.
