# KHTN SỐ – Bản vá bổ sung mô phỏng đo chu vi bút chì

## Nguyên tắc
- Bản vá bổ sung, không xóa/đổi tên bảng Supabase.
- Giữ nguyên biểu mẫu báo cáo, lưu Cloud, xuất CSV và in PDF hiện có trong `/practice`.
- Không thêm thư viện npm mới, không thay `package.json`.
- Mô phỏng được đặt ở route riêng `/practice/pencil-circumference` và chỉ thêm một thẻ liên kết vào phòng thực hành hiện có.

## Các tệp cần cập nhật lên nhánh `main`
1. **Thay thế** `src/app/practice/page.tsx` bằng tệp cùng đường dẫn trong gói này. Đây là tệp cũ được giữ nguyên nội dung, chỉ thêm thẻ mở mô phỏng.
2. **Thêm mới** `src/app/practice/pencil-circumference/page.tsx`.

Không tải thư mục `KHTNSO-main` lồng bên trong lên GitHub; lấy đúng các tệp trong `KHTNSO-main/src/...` và đặt vào cùng đường dẫn ở repo gốc.

## Cách cập nhật trực tiếp nhánh chính
1. Tải ZIP và giải nén trên máy.
2. Mở repository GitHub hiện tại, chọn nhánh `main`.
3. Mở `src/app/practice/page.tsx` → Edit file → thay nội dung bằng bản trong gói; Commit changes vào `main`.
4. Chọn **Add file → Create new file**, đặt tên `src/app/practice/pencil-circumference/page.tsx`, dán nội dung tệp mới, commit vào `main`.
5. Chờ Vercel deploy xong; kiểm tra `/practice`, bấm “Mở mô phỏng”, thử điều chỉnh số vòng, đổi GHĐ/ĐCNN, nhập số đo, rồi quay lại kiểm tra nút lưu báo cáo/CSV/PDF cũ.

## Phạm vi và giới hạn đã biết
- Gói này là bản mô phỏng tương tác nhẹ, dùng SVG/React và không yêu cầu Three.js. Nó chưa phải bản dựng 3D đầy đủ có OrbitControls như HTML mẫu ban đầu.
- Hình vẽ thước là minh họa; phần đọc số đo và kiểm tra là hoạt động học tập mô phỏng, không nên dùng như phép đo thực nghiệm chuẩn xác.
- Bản nguồn hiện có trong môi trường là `KHTNSO-main (2)(1).zip` (ngày trong ZIP: 21/10/2026). Nếu nhánh `main` đã có thay đổi mới hơn ở chính tệp `src/app/practice/page.tsx`, hãy giữ các thay đổi mới hơn và chỉ chèn thẻ liên kết; không ghi đè mù.
- Chưa xác nhận build/deploy trên Vercel hoặc kiểm tra với Supabase live.
