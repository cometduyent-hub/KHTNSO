# KHTN SỐ V11 PLUS3 — Bảng dạy học tương tác

## Cách áp dụng
- Gói này dựa trên mã nguồn KHTN SỐ V11 PLUS2 INTERACTIVE TEACHING BOARD đã triển khai.
- Giữ nguyên route `/teaching-board` và các route phòng học khác.
- Không cần thay đổi schema Supabase hoặc biến môi trường.
- Triển khai theo quy trình hiện tại của dự án; nếu đang có bản đang chạy, nên lưu bản sao trước khi thay thế.

## Phần bổ sung
- Công cụ Chọn/di chuyển để kéo các hình mẫu và chữ đến vị trí mong muốn.
- Thấu kính hội tụ/phân kỳ: điều chỉnh tiêu cự, khoảng cách vật và chiều cao vật; vẽ tia minh họa và ảnh theo tham số.
- Lăng kính: điều chỉnh góc xoay; sơ đồ tán sắc tách chùm thành bảy màu, đỏ lệch ít hơn tím.
- Khúc xạ: điều chỉnh góc tới, chiết suất và chiều truyền không khí → nước / nước → không khí; hiển thị góc khúc xạ ước lượng và trường hợp phản xạ toàn phần.
- Đồ thị s–t, v–t và U–I: có lưới tọa độ, điều chỉnh giới hạn trục x/y.
- Dao động điều hòa và vòng tròn lượng giác: điều chỉnh biên độ, tần số góc và pha.
- Mạch điện theo linh kiện: chèn riêng nguồn, điện trở, đèn, khóa K, ampe kế, vôn kế và dây nối để giáo viên tự bố trí.
- Lưu các tham số bảng cùng nội dung trong localStorage; giữ khả năng lưu bảng và xuất PNG.

## Giới hạn cần biết
- Các hình vẽ là mô hình minh họa 2D, chưa phải bộ giải quang học/điện học chính xác hoàn chỉnh; đồ thị hiện là mẫu minh họa tuyến tính, chưa có trình soạn hàm tổng quát hay nhập bảng số liệu tùy ý.
- Tia sáng có thể tự vẽ bằng công cụ đoạn thẳng/mũi tên; chưa có cơ chế kéo trực tiếp đầu tia để thay đổi góc như một phần mềm mô phỏng chuyên dụng.
- Chưa thể khẳng định đã rà soát toàn bộ SGK/SBT KHTN 6–9 và Vật lí 10–12 vì thư viện hiện truy xuất được chỉ có một số tài liệu kế hoạch bài dạy, chưa có đầy đủ các sách nguồn.
- Kiểm tra cú pháp bằng `scripts/check-syntax.cjs`; chưa chạy được `next build` tại môi trường này do không có `node_modules`.
