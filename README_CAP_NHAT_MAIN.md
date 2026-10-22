# KHTN SỐ V21 — bổ sung 3 thí nghiệm đo lường

## Mục tiêu
Bổ sung 3 trang thí nghiệm vào khu vực `/practice`, không đổi cấu trúc database, không thêm dependency npm và không sửa chức năng lưu báo cáo Cloud / CSV / in PDF hiện có.

## Tệp trong gói
- `src/app/practice/page.tsx` — phiên bản phòng thực hành có sẵn liên kết mô phỏng bút chì từ gói V19, đồng thời bổ sung thẻ mở 3 mô phỏng mới.
- `src/app/practice/stone-volume/page.tsx` — đo thể tích viên đá/sỏi bằng phương pháp dời chỗ của nước.
- `src/app/practice/table-length/page.tsx` — đo chiều dài bàn, nhập số đọc ở đầu/cuối thước và đổi cm/dm.
- `src/app/practice/bowl-circumference/page.tsx` — đo chu vi miệng chén bằng dây mềm.

## Cập nhật trực tiếp vào nhánh main
1. Tải ZIP và giải nén.
2. Mở repository GitHub hiện tại, chọn nhánh `main`.
3. Tạo 3 thư mục và thêm 3 tệp `page.tsx` mới theo đúng đường dẫn trong ZIP.
4. Với `src/app/practice/page.tsx`, **không thay thế mù quáng nếu nhánh main đã có thay đổi mới hơn**. Ghép riêng thẻ `<section>` có tiêu đề `Các bài đo lường khác` vào trang thực hành hiện tại, trước thẻ đóng `</main>`. Giữ nguyên toàn bộ phần import, state, hàm `save`, `csv`, và liên kết mô phỏng bút chì đang có.
5. Commit vào `main`; đợi Vercel deploy.
6. Kiểm tra các địa chỉ:
   - `/practice`
   - `/practice/stone-volume`
   - `/practice/table-length`
   - `/practice/bowl-circumference`
   - `/practice/pencil-circumference` (mô phỏng bút chì hiện tại)

## Lưu ý kỹ thuật và khoa học
- Không có migration SQL và không cần thay đổi bảng Supabase.
- Ba trang mới là mô phỏng tương tác dùng SVG/HTML và số liệu mô hình, không phải mô hình 3D vật lý hoàn chỉnh. Mực nước/chiều dài/đường kính là tham số mô phỏng để học sinh luyện thao tác đọc số đo.
- Thí nghiệm thể tích dùng công thức V_vật = V_sau − V_đầu; cần bảo đảm vật chìm hoàn toàn và nước không tràn.
- Thí nghiệm bàn thể hiện cách lấy số đọc cuối trừ số đọc đầu; khi đo thực tế cần đặt vạch 0 đúng đầu vật hoặc hiệu chỉnh vị trí đầu thước.
- Thí nghiệm chén dùng dây mềm không co giãn, ôm sát miệng chén rồi duỗi thẳng để đọc chiều dài.
- Chưa chạy build toàn dự án hoặc kiểm thử trên Vercel/Supabase. Sau commit cần xem log deployment trước khi coi là hoàn tất.
