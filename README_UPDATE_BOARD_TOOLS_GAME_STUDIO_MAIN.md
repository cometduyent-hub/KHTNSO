# KHTN SỐ – Bản cập nhật bảng tương tác & phòng tạo trò chơi

## Phạm vi cập nhật
Bản cập nhật này được thực hiện trên mã nguồn trong ZIP người dùng cung cấp, theo nguyên tắc bổ sung:
- Không tạo website mới.
- Không xóa route `/simulations` và các trang thực hành hiện có.
- Không sửa schema/migration Supabase.
- Không sửa `.env`, `.env.example`, thông tin kết nối hoặc biến môi trường.
- Giữ nguyên chức năng bảng tương tác, lưu trang, công thức, thư viện hình mẫu, undo/redo và các phòng hiện hữu.

## Tính năng mới

### 1. Bảng tương tác – bộ dụng cụ đo ảo
Mở `/teaching-board`, chọn **Dụng cụ đo ảo**:
- Thước thẳng: có vạch chia, kéo để đặt lên hình vẽ, xoay và đổi kích thước.
- Ê-ke: thao tác đặt, xoay và thay đổi kích thước.
- Thước đo góc: có vạch chia góc, xoay và thay đổi kích thước.
- Compa: kéo đặt, xoay, thay đổi kích thước; kéo trên vùng trống để dựng đường tròn và xem bán kính.
- Đo khoảng cách: kéo từ điểm đầu đến điểm cuối trên vùng bảng, hiển thị chiều dài theo tỷ lệ px/cm có thể hiệu chỉnh.
- Khi lớp dụng cụ đang mở, canvas viết tạm khóa pointer để thao tác dụng cụ không làm phát sinh nét vẽ; đóng dụng cụ để viết/vẽ tiếp.

**Hiệu chuẩn:** giá trị px/cm ban đầu chỉ là tỷ lệ làm việc trên bảng số, không tự động đại diện cho kích thước vật lý của màn hình. Giáo viên điều chỉnh px/cm theo quy ước hoặc vật chuẩn đang sử dụng.

### 2. Phân tích đồ thị
Bổ sung dưới vùng bảng:
- Nhập dãy tọa độ `(x,y)` của đường 1 và đường 2.
- Tính hệ số góc của đoạn đầu đường 1.
- Tính diện tích đa giác theo công thức dây giày từ dãy điểm đường 1 (cần ít nhất 3 điểm).
- Tính giao điểm của hai đường thẳng kéo dài qua hai điểm đầu của mỗi dãy.
- Hiển thị trường hợp thiếu dữ liệu hoặc hai đường song song.

### 3. Phòng tạo trò chơi
Route mới: `/game-studio`.
- Gọi tên học sinh ngẫu nhiên, chọn số lượng tên mỗi lượt.
- Chia danh sách thành 2–8 đội, số lượng thành viên chênh lệch tối đa một.
- Đồng hồ đếm ngược, tạm dừng và đặt lại.
- Bảng điểm nhanh cho 8 đội.
- Danh mục nền tảng được phân nhóm: Wayground (Quizizz), Kahoot!, Blooket, Wordwall, Baamboozle, Educaplay, LearningApps và Genially.
- Tìm kiếm ứng dụng, lọc theo mục đích, mở trang chính thức.

**Lưu ý tích hợp:** các nền tảng bên ngoài được mở qua liên kết chính thức. Bản cập nhật không giả lập đăng nhập, không tự tạo trò chơi trong tài khoản của giáo viên và không tuyên bố có API/OAuth khi chưa cấu hình quyền truy cập của từng nhà cung cấp.

## Điều hướng
- Thêm mục **Phòng trò chơi** vào thanh điều hướng.
- Thêm **Phòng tạo trò chơi** vào danh sách phòng học trên trang chủ.
- Đổi lối tắt cũ “Vào phòng thí nghiệm” ở trang chủ thành “Vào phòng tạo trò chơi”.
- Đổi thẻ “Phòng thí nghiệm” trong khu vực mở nhanh của bảng tương tác thành “Phòng tạo trò chơi”.
- Route `/simulations` vẫn được giữ nguyên để bảo toàn nội dung cũ và các liên kết đã chia sẻ.

## Các file được thêm
- `src/components/board/BoardMeasuringTools.tsx`
- `src/app/game-studio/page.tsx`

## Các file được cập nhật
- `src/app/teaching-board/page.tsx`
- `src/components/Shell.tsx`
- `src/lib/data.ts`
- `src/app/page.tsx`

## Cập nhật vào nhánh chính (main)
1. Tải ZIP cập nhật và giải nén.
2. Đối chiếu thư mục `KHTNSO-main` với repository hiện tại.
3. Chỉ đưa các file thêm mới/cập nhật được liệt kê ở trên vào nhánh `main`; không thay `.env` hoặc cấu hình triển khai.
4. Commit và push lên `main`, sau đó để Vercel deploy từ cấu hình repository hiện tại.
5. Mở kiểm tra `/teaching-board` và `/game-studio`.

Không cần chạy SQL migration cho bản cập nhật này.

## Kiểm tra đã thực hiện
- `node scripts/check-syntax.cjs`: **77 tệp, 0 lỗi cú pháp**.
- Chưa xác nhận build production hoặc kiểm thử trình duyệt thực tế.
- Chưa chạy được `tsc --noEmit` trong môi trường đóng gói vì ZIP không kèm `node_modules`; TypeScript báo thiếu React, Next, Supabase và các type package. Đây là thiếu dependency của môi trường kiểm tra, không phải kết quả xác nhận lỗi kiểu của riêng các file mới.
