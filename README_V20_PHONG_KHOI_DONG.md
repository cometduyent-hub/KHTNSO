# KHTN SỐ – PHÒNG KHỞI ĐỘNG V20

## Nền tảng
- Bản nền: mã nguồn V15.1 đã sửa lỗi `initialRosterLabel`.
- Phạm vi: nâng cấp Phòng Tiến trình dạy học / Phòng Khởi động.
- Không thay đổi `.env`, cấu hình Vercel, Supabase schema/RLS, package dependencies hoặc các phòng khác.

## Nội dung V20
1. Giữ lại bảng điều khiển Khởi động, 7 trò chơi gọi tên/chia nhóm tích hợp và thư viện ứng dụng ngoài.
2. Giữ luồng danh sách học sinh dùng chung trong phiên và thư viện danh sách lớp.
3. Giữ sổ kế hoạch theo tiết học, lựa chọn câu hỏi từ ngân hàng câu hỏi đã công bố và luồng phòng chơi Realtime hiện có.
4. Bổ sung lịch sử phiên khởi động: bài học, khối/lớp, công cụ, thời lượng dự kiến, sĩ số, số câu hỏi, thời điểm bắt đầu/kết thúc và trạng thái.
5. Bổ sung tổng quan số phiên, số phiên hoàn thành, phiên đang diễn ra và tổng lượt học sinh.
6. Bổ sung xuất lịch sử CSV để mở bằng Excel.
7. Bổ sung thao tác đánh dấu hoàn thành phiên và khôi phục phiên đang diễn ra sau khi tải lại trang.
8. Bổ sung tạm dừng/tiếp tục đồng hồ khởi động.

## Lưu trữ và giới hạn tích hợp
- Kế hoạch, thư viện danh sách và lịch sử phiên được lưu trong `localStorage` của trình duyệt hiện tại. Chúng không tự đồng bộ sang máy khác hoặc tài khoản khác.
- Ngân hàng câu hỏi và phòng thi đấu trực tiếp tiếp tục sử dụng kết nối Supabase/Reatime đã có trong dự án.
- Các ứng dụng bên ngoài hiện được mở bằng liên kết chính thức; không tuyên bố đồng bộ API, danh sách lớp hoặc điểm số nếu nhà cung cấp không cấp quyền/API tương ứng.
- Muốn đồng bộ kế hoạch/lịch sử giữa nhiều thiết bị cần thiết kế bảng dữ liệu, quyền RLS và quy trình migration riêng. V20 này không tự ý thay đổi các phần đó để bảo toàn dữ liệu đang chạy.

## Tệp thay đổi
- `src/app/game-studio/page.tsx`

## Kiểm tra đã thực hiện
- `node scripts/check-syntax.cjs`: 81 tệp, 0 lỗi cú pháp.
- Không thể chạy `next build`/kiểm thử trình duyệt trong môi trường tạo gói vì không có `node_modules`.
- `tsc --noEmit` được thử nhưng không thể xác nhận do thiếu các gói và khai báo kiểu (React, Next, Supabase, XLSX, Tailwind và Node types) trong môi trường này.

## Cập nhật
Giải nén bản FULL vào bản sao lưu dự án hiện tại hoặc áp dụng PATCH chỉ ghi đè đúng tệp nêu trên. Giữ nguyên các biến môi trường trên Vercel. Sau khi cập nhật nhánh `main`, kiểm tra build/deploy và thử: bắt đầu kế hoạch, tạm dừng/tiếp tục đồng hồ, đánh dấu hoàn thành, tải lại trang để xem lịch sử, xuất CSV, mở trò chơi và màn hình trình chiếu.
