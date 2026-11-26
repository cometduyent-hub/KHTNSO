# KHTN SỐ – Projector V9: Race & Orbit Motion Fix

## Mục tiêu sửa lỗi

V9 sửa hai phần hoạt cảnh chưa hiển thị chuyển động đúng trong màn hình máy chiếu, dựa trên mã nguồn V8.

## 1. Đường đua thần tốc

- Không còn phụ thuộc vào `@keyframes` với quãng đường phần trăm cố định.
- Khi nhận một lượt đua mới, màn chiếu đo vị trí thực tế của xe và vạch đích bằng `getBoundingClientRect()`.
- Mỗi làn xe được chạy bằng Web Animations API với quãng đường pixel tính đến vạch đích.
- Xe thắng có thời gian ngắn hơn; các xe khác vẫn chạy và lần lượt về đích.
- Khi hoạt cảnh chuyển sang trạng thái hoàn tất, vị trí cuối của xe được giữ lại thay vì nhảy về điểm xuất phát.
- Vạch đường, vệt tốc độ và bánh xe tiếp tục tạo cảm giác đường đang chuyển động.

## 2. Không gian bí ẩn – quỹ đạo tròn

- Mỗi hành tinh chạy một hoạt ảnh độc lập, quay đủ 360 độ quanh tâm sân khấu.
- Tâm quỹ đạo luôn được căn giữa bằng `translate(-50%, -50%)` trong chính các keyframe; tránh lỗi keyframe ghi đè phép căn giữa.
- Mỗi học sinh có bán kính, tốc độ, góc bắt đầu và chiều quay riêng.
- Khi trò chơi hoàn tất, các hành tinh được giữ đúng vị trí đang chuyển động; hành tinh trúng tuyển phóng lớn ở tâm.

## Tệp thay đổi

- `src/components/game-studio/ProjectorScreen.tsx`
- `README_PROJECTOR_V9_MOTION_FIX.md`

Không thay đổi trang điều khiển, logic chọn học sinh, cấu trúc Supabase, SQL, RLS hoặc biến môi trường.

## Cập nhật

1. Giải nén bản vá vào thư mục gốc dự án, giữ nguyên cấu trúc `KHTNSO-main/...`.
2. Commit và push lên nhánh `main`.
3. Chờ Vercel triển khai xong.
4. Đóng cửa sổ máy chiếu cũ, mở lại `/game-studio/projector`, nhấn `Ctrl + F5`.
5. Từ cửa sổ giáo viên, chọn Đường đua thần tốc và nhấn BẮT ĐẦU CUỘC ĐUA; sau đó thử Không gian bí ẩn và nhấn KHỞI ĐỘNG KHÔNG GIAN.

Hai cửa sổ phải dùng cùng trình duyệt và cùng origin website để đồng bộ qua BroadcastChannel/localStorage.

## Kiểm tra

Đã chạy `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp. ZIP được kiểm tra toàn vẹn. Chưa chạy `next build` hoặc kiểm thử trình duyệt thực tế trong môi trường đóng gói.
