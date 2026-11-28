# Bảng tương tác – V15: nét hình học có thể chọn và di chuyển

Nền mã nguồn: KHTNSO_BOARD_GEOMETRY_SMART_TOOLS_V14_MAIN_UPDATED.zip.

## Bổ sung
- Nét được tạo bằng chế độ Vẽ theo cạnh có thể bấm chọn trực tiếp.
- Kéo nét đã chọn để di chuyển đến vị trí khác mà không làm thay đổi dụng cụ.
- Nét đang chọn được tô màu cam và tăng độ dày để dễ nhận biết.
- Nút thao tác đổi thành “Xóa nét chọn / Đặt lại”: khi có nét được chọn, xóa riêng nét đó; khi không có nét chọn, thực hiện thao tác đặt lại như trước.
- Dụng cụ hình học vẫn kéo thân để di chuyển và kéo núm tím để xoay; dụng cụ được định vị trong vùng bảng 1200×700.

## Phạm vi
Chỉ sửa `src/components/board/BoardMeasuringTools.tsx` và thêm README. Không sửa cơ sở dữ liệu, SQL, Supabase, RLS, biến môi trường hay cấu hình deploy.

## Kiểm tra
`node scripts/check-syntax.cjs`: 77 tệp, 0 lỗi cú pháp.
Chưa chạy Next.js production build hoặc kiểm thử tương tác trên trình duyệt/màn hình cảm ứng thực tế.
