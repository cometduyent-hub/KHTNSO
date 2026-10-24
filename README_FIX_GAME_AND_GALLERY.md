# KHTN SỐ — Sửa liên kết Game và Phòng trưng bày

## Nguyên tắc
- Gói được chuẩn bị dựa trên `KHTNSO-main (2)(2).zip` và chỉ gồm các tệp cần ghép/thay.
- Không tạo website mới, không thay đổi biến môi trường, không xóa/đổi tên bảng đang có.
- Mọi thao tác đăng/xuất bản tác phẩm đều dành cho giáo viên/admin. Phòng và bình chọn mặc định đóng.

## Tệp cần cập nhật trên nhánh `main`
1. Thay `src/app/admin/game/page.tsx` bằng bản trong gói. Sửa bộ lọc để đọc hàng câu hỏi rộng hơn (`select('*')`), đọc `subject_code` hoặc metadata, và báo rõ khi không tìm thấy câu `status='published'` có loại `mcq`, `tf`, `short`. Giữ hợp đồng với RPC server-side: không đưa câu nháp/lưu trữ hay dạng tự luận vào Game.
2. Thay `src/app/gallery/page.tsx` bằng trang trưng bày có bố cục không gian tối/3D-style, kệ hình ảnh/video/STEM, tên tác giả, điều khiển hiển thị theo trạng thái phòng và nút bình chọn chỉ hoạt động khi giáo viên mở bình chọn.
3. Thay `src/app/admin/gallery/page.tsx` bằng CMS có tải tệp trực tiếp lên Supabase Storage, tên tác giả, xuất bản/ẩn/xóa tác phẩm, cùng nút mở/đóng phòng và mở/đóng bình chọn.
4. Thêm `supabase/migrations/20261024_gallery_control_upload.sql` vào đúng thư mục migration.

## Bắt buộc chạy migration
Mở Supabase SQL Editor của đúng project đang kết nối Vercel, chạy toàn bộ `20261024_gallery_control_upload.sql`. Migration bổ sung các bảng `gallery_items`, `gallery_votes`, `gallery_judge_scores`, `gallery_control`, tạo bucket `gallery-media` và policy upload. Không chạy được migration thì các trang sẽ tiếp tục báo lỗi schema cache.

## Vì sao câu hỏi Game có thể không hiện?
Bản hiện tại chỉ lọc cứng `status='published'`, `type in ('mcq','tf','short')` và so mã môn gần như chính xác. Các câu cũ lưu mã môn trong `metadata`, hoặc mã kiểu `KHTN7`, `ENGLISH7`, `LITERATURE_HISTORY_GEOGRAPHY`, có thể bị bỏ lọt. Bản sửa đọc cấu trúc hàng rộng hơn và chuẩn hóa mã môn. RPC server-side hiện vẫn yêu cầu `status='published'` và type `mcq/tf/short`; không đưa loại khác vào danh sách để tránh vòng chơi tạo được nhưng không chấm được.

Nếu danh sách vẫn trống, xem thông báo trên trang CMS. Cần xác minh RLS của `question_bank`, trường `status`, `type`, và `subject_code`/`metadata` thực tế; không nên nới quyền public cho ngân hàng câu hỏi vì có thể làm lộ đáp án.

## Triển khai
- Commit các tệp trên vào nhánh `main`; giữ nguyên các tệp khác.
- Chạy migration trước hoặc ngay sau commit.
- Kiểm tra `/admin/game`, `/game`, `/admin/gallery`, `/gallery`.
- Kiểm tra tải ảnh/video nhỏ trước, sau đó thử đóng phòng và xác nhận người xem không thấy tác phẩm; mở phòng nhưng để bình chọn đóng; cuối cùng mở bình chọn.

## Giới hạn kiểm thử
Đây là gói mã nguồn, chưa được triển khai vào GitHub/Vercel và chưa được chạy trên Supabase thực tế. Build dự án đầy đủ cần thực hiện trong repository với các dependency hiện tại. Tệp upload dựa trên Supabase Storage bucket `gallery-media` và giới hạn 100 MB, chỉ cho phép loại MIME được khai báo trong migration.
