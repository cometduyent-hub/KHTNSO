# KHTN SỐ — Bổ sung Phòng Thực hành 3D KHTN 7

## Các tệp trong gói

- `src/app/practice/khtn7/page.tsx` — trang mới với 5 bài thực hành có tiêu đề “Thực hành” trong SGK KHTN 7 Kết nối tri thức, theo thứ tự trang sách.
- `src/app/practice/page.tsx` — chỉ bổ sung thẻ liên kết vào trang hiện có; không thay thế các công cụ báo cáo/lưu Cloud/CSV/PDF và các mô phỏng hiện tại.
- `docs/THUC_HANH_KHTN7_KNTT.md` — danh mục đối chiếu SGK và phạm vi triển khai.

## Cách cập nhật vào nhánh `main`

1. Tạo nhánh dự phòng hoặc tải ZIP hiện tại của repository.
2. Trên GitHub chọn `main`.
3. Thêm `src/app/practice/khtn7/page.tsx` đúng đường dẫn.
4. Mở `src/app/practice/page.tsx` trên bản mới nhất của `main` và chỉ ghép thẻ liên kết có tiêu đề “Phòng Thực hành 3D — KHTN 7”; không thay toàn bộ tệp nếu đã có cập nhật khác.
5. Thêm `docs/THUC_HANH_KHTN7_KNTT.md` và file README này.
6. Commit lên `main`, chờ Vercel triển khai.
7. Kiểm tra `/practice` và `/practice/khtn7` trên máy tính lẫn điện thoại.

## Công nghệ và cấu hình

- Không thêm package, không yêu cầu migration SQL, không thay biến môi trường.
- Trang tải Three.js r128 và OrbitControls từ CDN; cần kết nối Internet để nạp mô hình 3D.
- Tương tác bằng chuột/cảm ứng: kéo xoay camera, cuộn/chụm phóng to; các thanh điều khiển thay đổi trạng thái mô phỏng.
- Phiếu ghi chép xuất ra CSV ở trình duyệt; không tự gửi dữ liệu học sinh lên server.

## Kiểm tra

Đã chạy script transpile cú pháp TypeScript/JSX của dự án: 72 tệp, 0 lỗi cú pháp. Chưa chạy `next build`, chưa thử trực tiếp trên Vercel. Sau khi deploy, cần xác nhận CDN không bị chặn bởi chính sách mạng/CSP và kiểm tra trên thiết bị thực tế.

## Phạm vi nội dung

Bản đầu tiên bao gồm đủ 5 bài có tiêu đề “Thực hành” theo mục lục SGK: Bài 24, 27, 32, 35, 38. Các hoạt động khám phá/thí nghiệm nằm trong những bài khác được liệt kê trong `docs/THUC_HANH_KHTN7_KNTT.md` như danh mục cần trích xuất tiếp, chưa được tuyên bố là đã mô phỏng đầy đủ.
