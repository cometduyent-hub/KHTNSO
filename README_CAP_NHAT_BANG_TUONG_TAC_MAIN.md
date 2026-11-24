# CẬP NHẬT BẢNG TƯƠNG TÁC – NHÁNH MAIN

## Phạm vi cập nhật

Bản cập nhật này tiếp tục trên mã nguồn `KHTNSO-main(2).zip`, sử dụng trang bảng tương tác đã bỏ phần nhúng phòng hình học 3D riêng. Toàn bộ thao tác dạy học diễn ra trên **một mặt bảng 2D duy nhất**.

Chỉ thay thế:

- `src/app/teaching-board/page.tsx`

Không thay đổi schema/migration Supabase, biến môi trường, cấu hình Vercel, CMS bảng tương tác, các phòng học khác hoặc dependency trong `package.json`.

## Công cụ trên cùng một mặt bảng

- Bút viết, tẩy, đoạn thẳng, nét đứt, véc tơ/mũi tên, hình tròn, elip, tam giác, chữ nhật.
- Menu hình không gian 2D: lập phương, hộp chữ nhật, chóp, trụ, nón, cầu; vẽ theo quy ước nét thấy/nét khuất.
- Sơ đồ KHTN/Vật lí: thấu kính hội tụ/phân kì, lăng kính, tán sắc, gương, khúc xạ, mạch điện, linh kiện điện, véc tơ lực.
- Đồ thị s–t, v–t, a–t, U–I, hàm số, dao động điều hòa và vòng tròn lượng giác; nhập tọa độ điểm và chỉnh điểm trên bảng.
- Công thức nhanh và mẫu nội dung từ CMS đang có.
- Chọn, kéo, xoay, đổi kích thước, nhân bản và xóa đối tượng.

## Nâng cấp quy trình giảng dạy

- Chia bài giảng thành nhiều trang bảng; thêm, đổi tên, chuyển trang, nhân bản và xóa trang.
- Mỗi trang giữ nội dung riêng; tự lưu cục bộ theo khóa `khtnso-teaching-board-v2`.
- Đọc tương thích dữ liệu một trang từ phiên bản trước.
- Xuất PNG trang hiện tại.
- Sao lưu toàn bộ bài giảng ra JSON và nhập lại JSON trên thiết bị khác.
- Mở bảng toàn màn hình.
- Phím tắt: `Ctrl/Cmd + Z` hoàn tác, `Ctrl/Cmd + Shift + Z` hoặc `Ctrl/Cmd + Y` làm lại, `Delete/Backspace` xóa đối tượng đang chọn, `Esc` chuyển về công cụ chọn.

## Cách cập nhật lên GitHub nhánh main

1. Sao lưu repository hiện tại.
2. Giải nén gói `KHTNSO_BOARD_INTERACTIVE_PATCH_MAIN.zip`.
3. Chép file `src/app/teaching-board/page.tsx` vào đúng đường dẫn trong repository và thay thế file cũ.
4. Commit và push lên nhánh `main`.
5. Chờ Vercel deploy; mở `/teaching-board` và kiểm tra các thao tác theo checklist bên dưới.

## Checklist kiểm tra sau deploy

- Mở bảng cũ đã lưu ở trình duyệt để kiểm tra tương thích dữ liệu một trang.
- Vẽ bằng chuột, bút cảm ứng và thao tác cảm ứng.
- Thử chèn, di chuyển, xoay, đổi kích thước, nhân bản và xóa một hình.
- Tạo nhiều trang, đổi tên, chuyển trang, nhân bản trang và tải lại trình duyệt.
- Xuất PNG; sao lưu JSON; nhập lại JSON.
- Chèn các hình thấu kính, hình khối và ba đồ thị s–t/v–t/a–t.
- Kiểm tra CMS công thức/mẫu và các đường dẫn phòng học khác.

## Kiểm tra thực hiện trong môi trường đóng gói

- TypeScript `transpileModule`: 75 tệp `.ts/.tsx`, không phát hiện lỗi cú pháp.
- Chưa chạy `npm run build` vì gói mã nguồn không kèm `node_modules`; cần để Vercel hoặc môi trường đã cài dependency thực hiện build đầy đủ.

Lưu ý: đây là bảng vẽ/biên soạn bài giảng trực tiếp. Các hình quang học, sơ đồ mạch và đồ thị là công cụ minh họa; không nên xem chúng là bộ mô phỏng thực nghiệm định lượng thay thế các mô-đun thí nghiệm chuyên biệt.
