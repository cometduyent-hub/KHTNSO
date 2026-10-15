# KHTN SỐ – Bảng viết tương tác (bản cập nhật)

Bản cập nhật này giữ nguyên cấu trúc ứng dụng và các đường dẫn hiện có; chỉ thay đổi trang `src/app/teaching-board/page.tsx` để biến bảng tương tác từ trang trình bày thành bảng viết trực tiếp trong lớp.

## Chức năng trên bảng
- Viết/vẽ tự do bằng chuột hoặc bút cảm ứng, chọn màu và độ dày nét.
- Công cụ tẩy theo vùng, ghi chữ tại vị trí chạm, hoàn tác, xóa bảng.
- Nền bảng trắng, xanh nhạt, xanh bảng hoặc tối; bật/tắt lưới căn hình.
- Chèn sơ đồ thấu kính, lăng kính, tán sắc ánh sáng, mạch điện, phản xạ, khúc xạ, nam châm, lò xo và véc tơ điều chỉnh góc/độ lớn.
- Ghi công thức trực tiếp lên bảng, in và xuất SVG.
- Tự lưu bảng hiện tại trong localStorage của trình duyệt.
- Giữ liên kết nhanh đến Thư viện, Thực hành 3D, Phòng thí nghiệm và Sáng tạo.

## Cập nhật
Có thể thay riêng `src/app/teaching-board/page.tsx` nếu muốn giảm phạm vi thay đổi. Nếu thay toàn bộ dự án bằng ZIP này, giữ nguyên các biến môi trường Vercel/Supabase hiện có.

## Kiểm tra
Đã chạy `node scripts/check-syntax.cjs`: 65 tệp, không phát hiện lỗi cú pháp. Chưa xác nhận build Next.js hoàn chỉnh hoặc kiểm thử tương tác trên trình duyệt production trong môi trường này.
