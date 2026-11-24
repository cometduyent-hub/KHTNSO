# KHTN SỐ – Nâng cấp bảng tương tác thông minh

## Phạm vi
- Chỉ cập nhật `src/app/teaching-board/page.tsx`.
- Không thay đổi biến môi trường, schema/migration Supabase, CMS, route hoặc các phòng học khác.
- Giữ khóa lưu `khtnso-teaching-board-v2` và khả năng đọc dữ liệu trang/bảng cũ.

## Bổ sung trong phiên bản này
1. **Bắt điểm (Snap to grid):** khi bật, điểm đầu/cuối thao tác được hút về giao điểm lưới 32 px; phù hợp dựng sơ đồ, trục và hình có căn chỉnh.
2. **Căn góc (Angle assist):** tự căn các đoạn thẳng/véc tơ gần phương ngang, dọc hoặc chéo 45°; có thể tắt khi cần góc tùy ý.
3. **Phím tắt:** `V` chọn/di chuyển, `P` bút, `L` đoạn thẳng, `A` véc tơ, `T` chữ, `Ctrl+D` nhân bản, `Ctrl+Z` hoàn tác, `Ctrl+Y` làm lại, `Delete` xóa đối tượng, `Esc` quay về công cụ chọn.
4. Tiếp tục dùng một canvas 2D duy nhất, hỗ trợ chuột, cảm ứng và bút cảm ứng.

## Cập nhật nhánh main
Thay thế duy nhất file `src/app/teaching-board/page.tsx` bằng file cùng đường dẫn trong gói patch, sau đó commit/push vào `main`.

## Kiểm tra sau cập nhật
- Chạy `npm install` nếu môi trường chưa cài dependencies.
- Chạy `npm run check:syntax` và `npm run build`.
- Mở `/teaching-board`, thử bật/tắt Bắt điểm và Căn góc; thử các phím tắt; tải lại trang để xác nhận dữ liệu bảng cũ vẫn hiển thị.

Lưu ý: đây là các hỗ trợ căn chỉnh và thao tác giao diện; không tuyên bố là nhận dạng nét AI hay bộ giải mô phỏng vật lí định lượng. Các chức năng AI/nhận dạng cần tích hợp dịch vụ và kiểm thử riêng trước khi triển khai.
