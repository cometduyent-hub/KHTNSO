# Nâng cấp bảng tương tác – Nét vẽ thông minh

## Nội dung bổ sung
- Bổ sung tùy chọn **Nét thông minh** ngay trên thanh công cụ.
- Khi bật, nét bút tay có thể được nhận dạng ở mức hình học cơ bản:
  - Nét gần thẳng được chuyển thành đoạn thẳng có thể chọn và kéo chỉnh.
  - Nét khép kín gần hình tròn/elip được chuyển thành hình tròn hoặc elip chuẩn.
- Nếu nét không đủ điều kiện nhận dạng, bảng giữ nguyên nét vẽ tay để tránh tự ý biến đổi hình không rõ ràng.
- Nhận dạng chạy cục bộ trong trình duyệt; không gửi dữ liệu nét vẽ đến máy chủ.
- Có thể tắt **Nét thông minh** để viết/vẽ tự do như trước.

## Phạm vi và giới hạn
- Đây là nhận dạng hình học bằng quy tắc, không phải mô hình AI và không nhận dạng chữ viết tay.
- Bản này nhận dạng đoạn thẳng, đường tròn và elip; chưa tự nhận dạng đa giác, ký hiệu vật lý, mạch điện hoặc công thức.
- Không thay đổi schema Supabase, biến môi trường, route, quyền truy cập, CMS, cấu trúc trang bảng, khóa localStorage hay các phòng học khác.
- Tính năng bắt điểm, căn góc và phím tắt của gói trước vẫn được giữ.

## Cập nhật
1. Sao lưu nhánh `main` hoặc tạo commit dự phòng.
2. Giải nén gói patch và chép đúng tệp `src/app/teaching-board/page.tsx` vào dự án hiện tại.
3. Giữ nguyên các tệp cấu hình và biến môi trường đang có; không chạy migration SQL.
4. Kiểm tra: vẽ một nét thẳng, một vòng tròn, một elip; thử tắt/bật Nét thông minh; chọn và kéo các hình sau khi nhận dạng; thử viết tay tự do.
5. Chạy `npm install` nếu môi trường chưa có dependencies, sau đó `npm run check:syntax` và `npm run build` trước khi deploy.

## Kiểm tra trong gói bàn giao
- Đã kiểm tra cú pháp TSX của tệp được sửa bằng TypeScript transpile: không phát hiện lỗi cú pháp.
- Chưa chạy build toàn dự án vì bản làm việc không có `node_modules`.
