# CLASSROOM RANDOM GAME V3 – Hoàn thiện trò chơi gọi tên và chia nhóm

## Phạm vi cập nhật
- Thay khu vực gọi tên cũ trong `/game-studio` bằng `ClassroomRandomGames`.
- Giữ nguyên khu vực tạo trận thi đấu từ `question_bank` và trang tham gia `/game-studio/join/[code]`.
- Không thay đổi schema Supabase, biến môi trường, package dependencies hoặc các route hiện có.

## Liên kết danh sách học sinh
1. Giáo viên/admin đăng nhập.
2. Đọc các lớp `classes` có `status = active`.
3. Khi chọn lớp, đọc `class_members` theo `class_id`, `active = true`, `member_role = student`.
4. Lấy hồ sơ tương ứng từ `profiles` theo `id`, `active = true`, `role = student`.
5. Tương thích dữ liệu cũ: nếu lớp chưa có liên kết thành viên, thử đọc `profiles` theo `class_name = classes.name` và `grade = classes.grade`.
6. Hiển thị lỗi cụ thể nếu RLS/quyền đọc ngăn truy vấn; không giả vờ đã tải thành công.

## Năm trò chơi
- Vòng quay: mỗi học sinh có một lát trên vòng quay; kết quả được chọn từ toàn bộ danh sách và kim dừng tại đúng lát tên.
- Hộp quà: xáo trộn và gán trước tối đa 8 học sinh vào 8 hộp; mở hộp nào nhận đúng học sinh của hộp đó.
- Bốc thăm: bốc 1 hoặc số lượng tùy chọn, tránh trùng theo chế độ đã chọn.
- Ghép đội: chia ngẫu nhiên, phân phối vòng tròn để số lượng các đội lệch tối đa 1; xuất Excel.
- Ô cửa: gán trước học sinh và nhiệm vụ cho 12 ô; mở ô sẽ hiện đúng cặp tên/nhiệm vụ đã gán.

## Quản lý công bằng
- Một danh sách roster duy nhất được dùng chung cho năm trò chơi và được chuyển lên trang cha để dùng tiếp ở phần thi đấu câu hỏi.
- Chế độ `Không gọi trùng` dùng mã học sinh; nếu không có mã thì dùng tên đã chuẩn hóa.
- Lịch sử gọi tên chung giữa các trò chơi; có hoàn tác lượt cuối và đặt lại toàn bộ lượt.
- Có nhập XLSX/XLS/CSV, dán danh sách, tải mẫu Excel, xuất roster và xuất kết quả chia đội.
- Hiệu ứng âm thanh dùng Web Audio API, không cần thư viện hoặc tài nguyên ngoài.

## Cập nhật
- Thay `src/app/game-studio/page.tsx`.
- Thêm `src/components/game-studio/ClassroomRandomGames.tsx`.

## Kiểm tra
- `node scripts/check-syntax.cjs`: transpile cú pháp toàn bộ mã nguồn.
- Chưa chạy `next build`/kiểm tra type đầy đủ trong môi trường đóng gói vì `node_modules` chưa được cài đặt.

## Ghi chú triển khai
- Không cần chạy SQL migration mới.
- Nếu dropdown lớp trống: kiểm tra tài khoản giáo viên/admin, lớp đang `active`, và RLS đọc `classes`.
- Nếu lớp hiện nhưng 0 học sinh: kiểm tra thành viên trong CMS Lớp học; các dòng cần `active = true`, `member_role = student`, và hồ sơ `profiles` cần `active = true`, `role = student`.
- Nếu dữ liệu cũ chỉ có `profiles.class_name` và `grade`, fallback sẽ thử dùng các trường này.
