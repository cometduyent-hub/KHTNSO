# KHTN SỐ – cập nhật media và hình học trên bảng tương tác

## Các tệp trong bản vá
- `src/app/admin/exams/page.tsx`: dán ảnh từ clipboard vào câu hỏi; tải ảnh/âm thanh/video lên Storage và gắn vào câu hỏi.
- `src/app/admin/learning-upgrades/page.tsx`: dán ảnh vào bản thảo KHBD; tải ảnh/âm thanh/video lên Storage và lưu liên kết cùng hồ sơ KHBD.
- `src/app/exam/[id]/page.tsx`: hiển thị ảnh/âm thanh/video đã gắn với câu hỏi khi học sinh làm bài.
- `src/app/teaching-board/page.tsx`: thêm công cụ nét đứt, hình tròn, elip, tam giác, chữ nhật, lập phương, hộp chữ nhật, hình chóp, trụ, nón, cầu. Các hình là nét vẽ 2D minh họa phối cảnh, không phải mô hình 3D có thể xoay theo trục.

## Cập nhật trên nhánh chính
1. Sao lưu nhánh hiện tại.
2. Giải nén gói patch và chép đúng 4 tệp trên vào cùng đường dẫn trong repository hiện tại, thay thế đúng các tệp trùng tên. Không thay toàn bộ thư mục `src`.
3. Không cần migration SQL cho các thay đổi mã nguồn này.
4. Chức năng tải media yêu cầu bucket Storage `khtnso-submissions` và Storage policies cho người dùng đã đăng nhập, cho phép upload vào đường dẫn bắt đầu bằng UID của họ (ví dụ `<uid>/authoring/...`). Không thêm service-role key vào trình duyệt.
5. Commit lên nhánh chính theo quy trình đang dùng; kiểm tra Vercel Preview/build trước khi dùng production.

## Dùng tính năng
- Ngân hàng câu hỏi: Ctrl+V ảnh trong ô nội dung câu hỏi. Để thêm ảnh/âm thanh/video, dùng bộ chọn tệp hoặc điền URL.
- KHBD: Ctrl+V ảnh trong ô bản thảo. Để thêm âm thanh/video/ảnh, dùng bộ chọn tệp; URL được thêm vào danh sách học liệu.
- Bảng tương tác: chọn công cụ hình rồi kéo từ điểm đầu đến điểm cuối để vẽ. Các hình và nét được lưu cùng tiến trình bảng hiện tại trên trình duyệt và được xuất PNG như nội dung bảng khác.

## Giới hạn và kiểm tra
- Trình duyệt thường hỗ trợ dán ảnh bitmap từ clipboard; video/âm thanh được sao chép từ một số ứng dụng không cung cấp tệp qua clipboard. Vì vậy, dùng bộ chọn tệp cho video/âm thanh là phương án ổn định hơn.
- Các liên kết được tạo bằng signed URL thời hạn 1 năm. Tệp gốc vẫn nằm trong Storage; sau khi URL hết hạn, ứng dụng cần tạo URL mới hoặc chuyển tài nguyên công khai sang bucket phù hợp.
- Chưa chạy `next build` và chưa kiểm thử upload trên Supabase production trong môi trường tạo bản vá.
