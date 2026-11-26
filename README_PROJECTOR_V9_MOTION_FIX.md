# KHTN SỐ – Projector V9.1: Fix màn hình trắng khi khởi tạo

## Lỗi đã xác định từ gói V9 người dùng cung cấp

Trong `ProjectorScreen.tsx`, các mảng phụ thuộc của `useEffect` tham chiếu `mode` và `presentation` trước vị trí khai báo `const` của chúng. Vì mảng phụ thuộc được tính ngay trong lúc render, trình duyệt có thể ném lỗi `Cannot access 'mode' before initialization` và dừng toàn bộ màn hình trình chiếu.

## Cách sửa

- Chuyển khai báo `mode` và `presentation` lên trước các `useEffect` sử dụng chúng.
- Không thay đổi logic chọn học sinh, dữ liệu trình chiếu, hoạt ảnh vòng quay, xe đua hoặc quỹ đạo hành tinh.
- Không thay đổi Supabase, SQL, RLS, biến môi trường hay các trang khác.

## Cập nhật

1. Giải nén ZIP bản vá vào thư mục gốc dự án để thay đúng `KHTNSO-main/src/components/game-studio/ProjectorScreen.tsx`.
2. Commit và push tệp đã thay lên nhánh `main`.
3. Chờ Vercel triển khai thành công.
4. Mở lại `/game-studio/projector` và nhấn `Ctrl + F5`.
5. Khi màn hình đã mở, thử riêng trò Đường đua thần tốc và Không gian bí ẩn.

Đây là bản vá khắc phục lỗi khởi tạo đã tìm thấy trong gói V9 được gửi. Chưa có phiên chạy trình duyệt trực tiếp hoặc `next build` để xác nhận deployment thực tế.
