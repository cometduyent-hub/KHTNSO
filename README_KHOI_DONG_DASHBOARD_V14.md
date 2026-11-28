# KHTN SỐ – Bảng điều khiển Khởi động V14

## Mục tiêu
Bổ sung một bảng điều khiển tập trung trong Phòng Tiến trình dạy học > Khởi động, không thay đổi kiến trúc hay luồng dữ liệu hiện tại.

## Nội dung cập nhật
- Thẻ danh sách lớp hiển thị số học sinh đã nạp; nút điều hướng đến đúng bộ chọn lớp/danh sách hiện có trong `ClassroomRandomGames`.
- Danh sách chọn nhanh 7 trò chơi nội bộ. Khi chọn trò chơi và nhấn chuyển đến, component trò chơi hiện có chuyển sang đúng chế độ đã chọn.
- Danh sách 7 ứng dụng bên ngoài; mở URL chính thức ở thẻ mới.
- Nút mở màn hình trình chiếu riêng tại `/game-studio/projector`. Cơ chế BroadcastChannel/localStorage sẵn có trong component trò chơi vẫn đảm nhiệm đồng bộ trình chiếu.
- Không thay đổi cách tải lớp từ Supabase, nhập Excel/CSV, thống kê lượt gọi, logic trò chơi, ngân hàng câu hỏi hay các phòng khác.

## Tệp thay đổi
- `src/app/game-studio/page.tsx`
- `src/components/game-studio/ClassroomRandomGames.tsx`

## Giới hạn
- Chọn lớp vẫn sử dụng bộ chọn lớp có sẵn và quyền truy cập Supabase/RLS hiện tại.
- Ứng dụng bên ngoài vẫn là liên kết mở trang nhà cung cấp, chưa có OAuth/nhúng hoặc đồng bộ kết quả.
- Bảng điều khiển mở trình chiếu riêng; dữ liệu trình chiếu vẫn do component trò chơi gửi qua cơ chế hiện hữu.
- Chưa chạy Next.js production build hoặc kiểm thử trình duyệt trong môi trường này.

## Cập nhật nhánh chính
Sao lưu hai tệp hiện tại, thay bằng hai tệp trong bản vá và commit vào nhánh `main`. Không chạy migration và không thay đổi `.env`, Supabase schema/RLS hay cấu hình Vercel.
