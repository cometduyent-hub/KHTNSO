# KHTN SỐ — Bổ sung CMS bảng tương tác đa môn

## Những gì được bổ sung
- Trang quản trị mới: `/admin/board-config`.
- Danh mục 13 nhánh môn học/hoạt động giáo dục THCS trong bảng `subject_catalog`.
- Bảng `board_catalog` lưu công thức và mẫu nội dung theo môn/khối, có trạng thái draft/published/archived.
- Bảng tương tác có bộ chọn môn; đọc các công thức/mẫu đã xuất bản từ Supabase và giữ lại bộ công cụ/hình mẫu hiện có.
- Các mẫu nội dung có thể được chèn lên canvas, xuống dòng được hiển thị thành nhiều dòng.
- Thêm liên kết đến CMS mới trong bảng điều khiển Admin.
- Không xóa/đổi tên bảng hiện có, không đổi đường dẫn hiện có, không sửa biến môi trường.

## Cách triển khai
1. Sao lưu Supabase trước khi chạy migration.
2. Mở Supabase SQL Editor, chạy toàn bộ `supabase/migrations/20261020_multisubject_board_cms.sql`.
3. Đẩy toàn bộ mã nguồn lên GitHub theo cách deploy hiện tại; Vercel giữ nguyên cấu hình môi trường.
4. Đăng nhập bằng tài khoản Admin, mở `/admin/board-config`, kiểm tra các mẫu khởi tạo và thử thêm một mẫu nháp rồi xuất bản.
5. Mở `/teaching-board`, chọn môn tương ứng và xác nhận mẫu đã xuất bản xuất hiện. Kiểm tra `/admin`, tài liệu, thi/đánh giá và các phòng cũ.

## Lưu ý
- Migration là bổ sung, không thay schema cũ. Cần chạy trên đúng project Supabase đang kết nối website.
- RLS cho phép người đã đăng nhập đọc mục đã xuất bản; chỉ hồ sơ `profiles.role = admin` và `active = true` mới được quản lý dữ liệu CMS này.
- Công thức/mẫu CMS là nội dung do Admin nhập. Công cụ hình học/mô phỏng mới vẫn cần code xử lý riêng; thêm tên công cụ vào CMS không tự sinh chức năng tương tác mới.
- Bảng tương tác hiện vẫn lưu tiến trình vẽ vào localStorage của trình duyệt. Chức năng lưu bài giảng lên cloud và chia sẻ đa thiết bị chưa được thay thế/triển khai trong bản này.
- Danh mục môn học được seed theo yêu cầu, nhưng đây không phải toàn bộ nội dung chương trình SGK chính thức. Cần đối chiếu từng bộ SGK trước khi xuất bản nội dung chương trình.
