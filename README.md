# KHTN SỐ – Nâng cấp bảng tương tác: Nét thông minh đợt 2

## Phạm vi
- Chỉ cập nhật `src/app/teaching-board/page.tsx`.
- Mở rộng nhận dạng nét vẽ tay tại trình duyệt: đoạn thẳng, hình tròn, elip, tam giác và hình chữ nhật gần trục ngang/dọc.
- Các nét không đủ độ tin cậy vẫn được giữ nguyên dạng viết tay, tránh tự biến đổi sai.
- Giữ nguyên công cụ, dữ liệu bảng, lưu tự động hiện có, CMS, các trang/phòng khác và cấu hình Supabase/Vercel.

## Cách sử dụng
1. Mở `/teaching-board`, bật `Nét thông minh`.
2. Dùng bút vẽ một hình khép kín, tương đối rõ ràng.
3. Nếu hệ thống nhận dạng đủ tin cậy, nét sẽ được chuyển thành đối tượng hình học có thể chọn và di chuyển; nếu không, nét gốc được giữ lại.
4. Tắt `Nét thông minh` nếu muốn giữ nguyên mọi nét vẽ tay.

## Giới hạn đã biết
- Đây là nhận dạng hình học heuristic chạy cục bộ, không phải mô hình AI thị giác.
- Tam giác được chuẩn hóa theo khung bao; hình chữ nhật chỉ nhận dạng khi gần song song với trục bảng.
- Chưa nhận dạng đa giác bất kỳ, chữ viết tay, ký hiệu toán học hoặc suy luận nội dung Vật lí.

## Cập nhật
Sao lưu nhánh `main`, sau đó thay đúng tệp `src/app/teaching-board/page.tsx` bằng tệp trong gói patch. Không cần migration SQL và không chỉnh biến môi trường.

## Kiểm thử
Sau khi cập nhật, chạy `npm install` (nếu môi trường chưa cài dependencies), `npm run check:syntax`, `npm run build`; thử vẽ thẳng, tròn, elip, tam giác, chữ nhật và nét nguệch ngoạc để xác nhận nét không rõ vẫn được giữ nguyên.
