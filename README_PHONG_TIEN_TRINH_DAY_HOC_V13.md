# KHTN SỐ – V13: Phòng Tiến trình dạy học

## Phạm vi cập nhật
- Đổi tên mục điều hướng thành **Tiến trình dạy học**.
- Đổi tiêu đề trang thành **PHÒNG TIẾN TRÌNH DẠY HỌC**.
- Tổ chức trang thành 5 phòng nhỏ: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng, Giao nhiệm vụ học tập ở nhà.
- Phòng Khởi động giữ nguyên thành phần `ClassroomRandomGames` và các trò chơi gọi tên hiện có; component vẫn được mount khi chuyển phòng để không mất trạng thái.
- Bổ sung danh mục ứng dụng ngoài theo từng hoạt động, mở trong tab mới.
- Khu vực đấu trường ngân hàng câu hỏi được đặt trong Phòng Luyện tập; giữ nguyên logic Supabase Realtime hiện có.

## File thay đổi
- `src/app/game-studio/page.tsx`
- `src/components/Shell.tsx`

## Cập nhật
Sao chép hai file trên vào đúng đường dẫn trong nhánh `main`, commit và push để Vercel triển khai.

## Bảo toàn
Không thay đổi SQL, schema/RLS, Supabase, biến môi trường, cấu hình Vercel, route tham gia/phóng chiếu hoặc component trò chơi hiện có.

## Kiểm tra
`node scripts/check-syntax.cjs`: 81 files, 0 syntax errors. Chưa chạy Next build hoặc kiểm thử trình duyệt thực tế do gói nguồn không kèm `node_modules`.

## Lưu ý tích hợp
Các nền tảng Nearpod, Padlet, PhET, Genially, Wayground, Kahoot!, Blooket, Google Forms, Plickers, Canva, Tinkercad, GeoGebra, Desmos, Edpuzzle, Google Classroom và Quizlet hiện được tích hợp dưới dạng thẻ liên kết mở dịch vụ chính thức. Chưa có đăng nhập OAuth, nhúng nội dung hoặc đồng bộ dữ liệu giữa các dịch vụ ngoài với Supabase.
