# Bảng tương tác – nâng cấp dụng cụ hình học

## Nội dung
- Thước thẳng, ê-ke, compa và thước đo góc đều kéo di chuyển được trên toàn vùng bảng.
- Mỗi dụng cụ có núm xoay màu tím; kéo núm để xoay tự do theo góc chuột, không bị giới hạn theo nấc 5 độ.
- Giữ các nút xoay ±5° trên thanh công cụ để căn góc chính xác.
- Thanh Kích thước vẫn điều chỉnh phóng to/thu nhỏ.
- Giữ nguyên chế độ đo đoạn thẳng và vẽ đường tròn bằng compa.
- Hỗ trợ pointer events cho chuột, bút cảm ứng và cảm ứng chạm.

## Tệp thay đổi
- `src/components/board/BoardMeasuringTools.tsx`

Không thay đổi trang, API, cơ sở dữ liệu, SQL, RLS, biến môi trường hoặc dependency.

## Kiểm tra
- `node scripts/check-syntax.cjs`: 77 tệp, 0 lỗi cú pháp.
- Chưa chạy Next production build hoặc kiểm thử trực tiếp trên thiết bị/trình duyệt thực tế.

## Kiểm thử sau khi cập nhật
1. Mở `/teaching-board`, chọn `Dụng cụ đo ảo`.
2. Chọn lần lượt thước thẳng, ê-ke, compa và thước đo góc.
3. Kéo thân dụng cụ để di chuyển.
4. Kéo núm tím phía trên dụng cụ để xoay tự do.
5. Dùng nút ±5° để căn góc, thanh Kích thước để đổi kích thước.
6. Kiểm tra thao tác vẽ/đo ở vùng trống và compa vẽ đường tròn.
