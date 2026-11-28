# KHTN SỐ – Phòng Khởi động: Sổ kế hoạch theo tiết học (V15)

## Nội dung bổ sung
- Tạo, lưu, chọn khôi phục, cập nhật và xóa kế hoạch Khởi động theo từng bài/tiết.
- Lưu tên bài, khối, tên lớp, mục tiêu khởi động, trò chơi/ứng dụng, thời lượng, câu hỏi dẫn nhập, nhiệm vụ sau khi gọi tên và danh sách học sinh hiện tại.
- Khôi phục trò chơi, nhiệm vụ và danh sách học sinh vào component trò chơi đang có.
- Đồng hồ đếm ngược theo thời lượng đã cấu hình; nút Bắt đầu hoạt động mở ứng dụng ngoài hoặc đưa giáo viên đến trò chơi tích hợp.
- Dữ liệu kế hoạch được lưu cục bộ trong trình duyệt bằng localStorage với khóa `khtnso-startup-lesson-plans-v1`.

## Tệp thay đổi
- `src/app/game-studio/page.tsx`
- `src/components/game-studio/ClassroomRandomGames.tsx`

## Bảo toàn
Không thay đổi cấu trúc thư mục, schema/migration Supabase, ENV, RLS, cấu hình Vercel hoặc các phòng khác. Không thêm dependency.

## Lưu ý
Kế hoạch được lưu trên trình duyệt/máy đã tạo, không tự đồng bộ giữa các thiết bị hoặc tài khoản. Danh sách học sinh được lưu cùng kế hoạch trong localStorage của trình duyệt đó. Nếu xóa dữ liệu trình duyệt, các kế hoạch cục bộ có thể mất.

## Kiểm tra
`node scripts/check-syntax.cjs` – 81 tệp TypeScript/TSX, 0 lỗi cú pháp.
Chưa chạy Next.js build do gói source không kèm `node_modules`; cần cài dependencies trong môi trường triển khai/kiểm thử trước khi build.
