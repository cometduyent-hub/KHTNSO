# KHTN SỐ – Nâng cấp bảng tương tác: dụng cụ đo ảo

## Phạm vi
- Chỉ bổ sung vào `src/app/teaching-board/page.tsx`.
- Thêm lớp dụng cụ đo ảo hiển thị trực tiếp phía trên mặt bảng: thước thẳng, thước đo góc dạng bán nguyệt và ê-ke 45°.
- Có điều khiển xoay, dịch chuyển ngang/dọc và đặt lại vị trí/góc.
- Không thay đổi schema/migration Supabase, biến môi trường, định tuyến hay các phòng khác.

## Lưu ý sư phạm và độ chính xác
Các vạch chia hiện là lớp hỗ trợ quan sát/minh họa trên màn hình, chưa được hiệu chuẩn theo kích thước vật lý của màn hình hoặc pixel-to-centimeter. Không dùng để lấy số đo thực nghiệm chính xác. Đây là dụng cụ trực quan để căn hướng và minh họa góc; bước tiếp theo mới cần hiệu chuẩn theo kích thước màn hình hoặc một chuẩn tham chiếu.

## Cập nhật
1. Sao lưu nhánh `main`.
2. Thay tệp `src/app/teaching-board/page.tsx` bằng tệp trong gói patch.
3. Không cần chạy migration Supabase.
4. Kiểm tra trên `/teaching-board`: chọn từng dụng cụ, thay đổi góc và vị trí, tắt dụng cụ; xác nhận vẽ/chọn đối tượng và lưu bảng vẫn hoạt động.

## Kiểm tra đã thực hiện
- TypeScript transpile cú pháp cho tệp TSX đã sửa: 0 lỗi cú pháp.
- ZIP được kiểm tra tính toàn vẹn.
- Chưa chạy `npm run build` và chưa kiểm thử tương tác thực tế trên trình duyệt.
