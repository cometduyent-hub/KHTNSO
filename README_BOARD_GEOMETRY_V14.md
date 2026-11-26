# Bảng tương tác V14 – Vẽ bám cạnh và đặt dụng cụ tự do

## Nâng cấp
- Giữ cơ chế kéo thân dụng cụ để di chuyển tự do và núm tím để xoay.
- Chế độ `Vẽ theo cạnh` tạo nét độc lập, không gắn vào dụng cụ sau khi hoàn tất.
- Với thước thẳng, nét được giới hạn theo cạnh thước.
- Với ê-ke, nét được giới hạn theo cạnh đứng/cạnh đáy của ê-ke.
- Nét tạo ra được giữ trên bảng khi di chuyển hoặc xoay dụng cụ.
- Xóa/Đặt lại xóa cả nét mới tạo và các kết quả đo tạm thời.

## Cập nhật
Chép `src/components/board/BoardMeasuringTools.tsx` vào đúng đường dẫn trong dự án, ghi đè tệp cũ, sau đó push lên nhánh main.

## Kiểm tra
- `node scripts/check-syntax.cjs`: 77 tệp, 0 lỗi cú pháp.
- Chưa chạy Next.js production build và chưa kiểm thử tương tác thực tế trên trình duyệt/màn hình cảm ứng.

## Ghi chú
Chế độ vẽ theo cạnh hiện áp dụng cho thước thẳng và cạnh đáy/cạnh đứng của ê-ke. Chức năng tự bắt dính vào nét đã vẽ trước đó và chỉnh sửa/xóa từng nét riêng là các bước nâng cấp tiếp theo.
