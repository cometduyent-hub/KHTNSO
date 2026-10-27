# Gói bổ sung Phòng Thực hành 3D KHTN 7

## File trong gói
- `src/app/practice/khtn7/page.tsx` — trang bổ sung mô phỏng thực hành KHTN 7.
- `src/app/practice/page.tsx` — thêm một thẻ liên kết từ phòng thực hành đang có; giữ nguyên nội dung chức năng cũ.
- `docs/THUC_HANH_KHTN7_KNTT.md` — ghi rõ phạm vi SGK và những phần khám phá còn cần bóc tách từng trang.

## Cập nhật lên nhánh `main`
1. Tải ZIP và giải nén.
2. Mở repository hiện có trên GitHub, chọn nhánh `main`.
3. Tải lên đúng các đường dẫn tương ứng (ghi đè `src/app/practice/page.tsx` bằng bản trong gói; thêm thư mục `src/app/practice/khtn7/`; thêm tài liệu trong `docs/`).
4. Commit lên `main`; Vercel sẽ tự triển khai nếu đang liên kết với nhánh này.
5. Kiểm tra `/practice` và `/practice/khtn7`.

Không sửa `.env`, không thay biến môi trường, không thêm bảng Supabase và không tạo ứng dụng mới. Đây là gói bổ sung; chưa tuyên bố đã triển khai trực tiếp lên GitHub/Vercel.

## Giới hạn quan trọng
Gói hiện mô phỏng 5 bài mang tiêu đề chính thức “Thực hành” trong mục lục SGK. Các hoạt động “Khám phá” nằm rải rác trong những bài Lý, Hóa, Sinh chưa được xác nhận đầy đủ theo từng trang và chưa nên xem là đã hoàn tất. Cần đối chiếu nội dung/hình từng trang SGK trước khi thêm để không bịa hoặc thay đổi dụng cụ, quy trình.
