# Bảng tương tác – V13 dụng cụ hình học thông minh

Nền mã nguồn: `KHTNSO_BOARD_TOOLS_FREE_DRAG_ROTATE_MAIN_UPDATED.zip` (V12).

## Nâng cấp trong V13
- Giữ khả năng kéo thân dụng cụ và xoay tự do bằng núm điều khiển.
- Ê-ke: chế độ tạo đường tham chiếu, sau đó đặt đường song song hoặc vuông góc theo hướng đường tham chiếu.
- Thước đo góc: thao tác ba điểm (điểm trên tia 1 → đỉnh góc → điểm trên tia 2), hiển thị số đo độ.
- Compa: đặt tâm kim, chọn bán kính bằng thanh điều chỉnh, đặt chân bút để tạo đường tròn; có hiển thị bán kính.
- Thước thẳng: giữ chế độ đo đoạn thẳng và hiển thị độ dài theo cấu hình px/cm.
- Nút xóa/đặt lại để xóa kết quả hình học và đưa dụng cụ về trạng thái ban đầu.

## Tệp thay đổi
- `src/components/board/BoardMeasuringTools.tsx`

Không thay đổi các trang khác, Supabase, SQL, RLS, biến môi trường, cấu hình triển khai hay dependencies.

## Kiểm tra
- `node scripts/check-syntax.cjs`: 77 tệp, 0 lỗi cú pháp.
- ZIP được kiểm tra toàn vẹn.
- Chưa chạy `next build` và chưa kiểm thử chuột/cảm ứng trên trình duyệt thật trong môi trường triển khai. Sau khi deploy cần kiểm thử thao tác kéo/xoay, hai bước vẽ song song/vuông góc, ba điểm đo góc và đặt tâm/bán kính compa.
