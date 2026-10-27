# Phòng Thực hành 3D — KHTN 7 Kết nối tri thức

## Phạm vi gói

Gói bổ sung vào website KHTN SỐ hiện có tại route `/practice/khtn7`. Không tạo website mới, không sửa biến môi trường, không đổi/xóa bảng Supabase. Trang cũ `/practice` vẫn được giữ lại.

Danh mục được sắp xếp tăng dần theo số bài SGK. Mỗi hoạt động có mục tiêu, dụng cụ/mẫu vật, trình tự tương tác, quan sát và ghi chép; mô hình 3D có thể xoay/thu phóng bằng chuột hoặc thao tác cảm ứng trên thiết bị hỗ trợ.

## Năm bài có tiêu đề “Thực hành” trong mục lục SGK

1. Bài 24 — Thực hành: Chứng minh quang hợp ở cây xanh (SGK tr. 108–110).
2. Bài 27 — Thực hành: Hô hấp ở thực vật (SGK tr. 116–117).
3. Bài 32 — Thực hành: Chứng minh thân vận chuyển nước và lá thoát hơi nước (SGK tr. 136–137).
4. Bài 35 — Thực hành: Cảm ứng ở sinh vật (SGK tr. 145–147).
5. Bài 38 — Thực hành: Quan sát, mô tả sự sinh trưởng và phát triển ở một số sinh vật (SGK tr. 156–157).

## Các hoạt động khám phá/mô hình được đưa vào bản tương tác

- Bài 1: lực ma sát trượt và diện tích tiếp xúc; khả năng hòa tan của muối, đường, đá vôi dạng bột.
- Bài 2–7: mô hình nguyên tử; nguyên tố/kí hiệu; bảng tuần hoàn; mô hình phân tử; liên kết; hóa trị và công thức hóa học.
- Bài 8–9: tốc độ chuyển động; đo tốc độ.
- Bài 12–17: nguồn âm dao động; độ to/độ cao; phản xạ âm; vùng tối; phản xạ ánh sáng; ảnh qua gương phẳng.
- Bài 18–20: tương tác nam châm; từ trường; nam châm điện đơn giản.
- Bài 22–23, 25–30, 33: quang hợp/yếu tố ảnh hưởng; hô hấp tế bào; trao đổi khí; trao đổi nước ở thực vật; cảm ứng/tập tính.
- Bài 39: mô hình khám phá sinh sản vô tính.

## Quan trọng về độ trung thành với SGK

PDF người dùng cung cấp là bản quét hình ảnh, không có lớp văn bản trích xuất được. Vì vậy, năm bài mang tiêu đề “Thực hành” được giữ riêng; các mục “Khám phá” còn lại là kịch bản tương tác theo chủ đề bài và các hoạt động được nhận diện, **không được đánh dấu là bản sao nguyên văn đầy đủ của mọi câu lệnh/dụng cụ trong SGK**. Trước khi dùng làm tài liệu chuẩn kiểm tra, cần đối chiếu lần lượt từng trang ảnh SGK để xác minh câu chữ, số lượng dụng cụ, thông số và thứ tự thao tác. Không nên suy diễn thiết bị chỉ từ chủ đề bài học.

Mô hình 3D là mô hình học tập mang tính minh họa, không phải mô phỏng vật lí/hoá học chính xác tuyệt đối. Những thao tác có nhiệt, hóa chất, đồ thủy tinh hoặc dụng cụ sắc cạnh chỉ được minh họa trên màn hình; thực hành vật thật phải do giáo viên chuẩn bị và giám sát theo quy định an toàn của trường.

## Kiểm tra gói

- Không thay đổi `.env` hoặc schema Supabase.
- Chạy kiểm tra cú pháp TypeScript/JSX trên mã nguồn: `scripts/check-syntax.cjs`.
- Chưa xác nhận build production hoặc deploy thực tế trên Vercel.
