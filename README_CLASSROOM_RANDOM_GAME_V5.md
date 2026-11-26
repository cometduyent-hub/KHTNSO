# KHTN SỐ – Classroom Random Games V5

## Mục tiêu
Sửa phần trình chiếu riêng để các hoạt cảnh phản ánh dữ liệu và thao tác thật từ máy giáo viên, thay vì chỉ hiển thị hiệu ứng trang trí.

## Tệp cập nhật
- `src/components/game-studio/ClassroomRandomGames.tsx`
- `src/components/game-studio/ProjectorScreen.tsx`
- `src/app/game-studio/projector/page.tsx` (giữ nguyên route, đưa kèm để dễ chép đúng cấu trúc)

## Thay đổi chính
- Duy trì một kết nối `BroadcastChannel` từ máy giáo viên đến cửa sổ máy chiếu; đồng thời đồng bộ snapshot qua `localStorage` để có đường dự phòng.
- Vòng quay máy chiếu tạo đúng số lát theo sĩ số; tên từng học sinh đặt trên lát tương ứng. Vòng quay dùng đúng góc quay mà máy giáo viên tính, dừng tên trúng tại kim chỉ.
- Đường đua tạo nhiều làn xe, gắn tên học sinh lên từng xe, tăng tốc rồi kết thúc và công bố người thắng.
- Không gian bí ẩn tạo nhóm hành tinh mang tên học sinh, chuyển động hỗn loạn trong thời gian chọn, sau đó dừng và phóng lớn hành tinh có học sinh được chọn.
- Hộp quà và ô cửa hiển thị đúng tên đã gán khi giáo viên mở; trò bốc thăm và ghép đội cũng có bố cục trình chiếu riêng.
- Giữ nút bật/tắt nhạc nền; nhạc được tạo bằng Web Audio sau thao tác bật của người dùng để phù hợp chính sách autoplay của trình duyệt.
- Khi đổi trò chơi, đổi danh sách, hoàn tác hoặc đặt lại lượt, bộ đếm hoạt cảnh đang chạy được hủy để tránh kết quả cũ xuất hiện muộn.

## Cách dùng
1. Cập nhật các tệp trong ZIP lên nhánh `main`.
2. Chờ Vercel deploy thành công.
3. Mở `/game-studio`, chọn lớp/danh sách, chọn trò chơi.
4. Mở `/game-studio/projector` trên cửa sổ riêng hoặc dùng nút mở máy chiếu.
5. Bật nhạc trên cửa sổ máy chiếu một lần; sau đó điều khiển từ máy giáo viên.

## Kiểm tra
- `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp.
- Đã kiểm tra ZIP sau khi đóng gói.
- Chưa chạy `next build` hoặc kiểm tra TypeScript đầy đủ do môi trường đóng gói không có `node_modules`.
- Chưa xác nhận trên trình duyệt/máy chiếu thực tế; cần kiểm tra sau deploy với hai cửa sổ cùng origin.

## Tương thích và dữ liệu
- Không thay đổi schema Supabase, RLS, biến môi trường hoặc trang tham gia trò chơi.
- Dữ liệu điều khiển giữa hai cửa sổ sử dụng cùng origin và cùng trình duyệt. Đây không phải đồng bộ đa thiết bị qua mạng.
