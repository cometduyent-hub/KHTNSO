# KHTN SỐ – Hotfix V15.1: Khắc phục lỗi client-side tại Phòng Khởi động

## Nguyên nhân

Trong `ClassroomRandomGames.tsx`, component sử dụng `initialRosterLabel` trong `useEffect` nhưng thiếu biến này trong phần destructuring props. Khi component khôi phục danh sách học sinh, trình duyệt có thể phát sinh `ReferenceError` và làm trang Phòng Tiến trình dạy học bị Application error.

## Sửa đổi

- Bổ sung `initialRosterLabel` vào destructuring props.
- Không thay đổi giao diện, luồng trò chơi, lưu kế hoạch, dữ liệu, cấu trúc dự án hoặc các tích hợp Supabase.
- Chỉ thay đổi `src/components/game-studio/ClassroomRandomGames.tsx`.

## Cách cập nhật

1. Giải nén bản vá tại thư mục gốc dự án (giữ nguyên đường dẫn `src/...`).
2. Commit và push thay đổi lên nhánh `main`.
3. Deploy lại trên Vercel.
4. Mở lại Phòng Tiến trình dạy học; thử chọn tab Khởi động, khôi phục một kế hoạch đã lưu và kiểm tra danh sách học sinh.

## Kiểm tra đã thực hiện

- `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp.
- Chưa chạy `next build`/trình duyệt vì gói source không có `node_modules`; cần xác nhận lại trên deployment sau khi cập nhật.
