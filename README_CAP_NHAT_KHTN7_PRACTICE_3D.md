# Cập nhật Phòng Thực hành 3D KHTN 7

Đây là **bản vá cho website hiện có**, không phải website mới.

## Tệp trong gói

1. `src/app/practice/khtn7/page.tsx` — trang phòng thực hành tương tác 3D và danh mục hoạt động theo số bài SGK.
2. `src/app/practice/page.tsx` — thêm liên kết từ Phòng Thực hành hiện có sang trang KHTN 7.
3. `docs/THUC_HANH_KHAM_PHA_KHTN7_KNTT.md` — danh mục, phạm vi và giới hạn xác minh.

## Đưa lên GitHub nhánh main

1. Sao lưu hoặc tải ZIP mã nguồn đang triển khai trước khi thay tệp.
2. Giải nén gói vá; mở thư mục `KHTNSO-main` trong gói.
3. Chép đúng các tệp theo đường dẫn tương ứng vào repository hiện có, chấp nhận thay thế đúng hai tệp `page.tsx` nêu trên và thêm hai tệp tài liệu.
4. Commit và push lên nhánh `main`. Vercel sẽ tự triển khai nếu repository đã được liên kết như hiện tại.
5. Kiểm tra `/practice` và `/practice/khtn7` sau deploy.

Không cần sửa biến môi trường hoặc chạy migration Supabase cho gói này. Mô hình 3D tải Three.js từ CDN nên thiết bị cần có kết nối Internet. Nếu chính sách mạng chặn CDN, vùng mô hình sẽ báo lỗi thay vì âm thầm báo đã tải thành công.

## Giới hạn cần đọc

Năm bài có tiêu đề “Thực hành” được phân biệt rõ. Các hoạt động khám phá còn lại hiện là kịch bản tương tác theo chủ đề, chưa phải bản chép nguyên văn đã kiểm tra từng dòng từ toàn bộ 182 trang quét. Vui lòng đọc `docs/THUC_HANH_KHAM_PHA_KHTN7_KNTT.md` trước khi dùng làm tài liệu chuẩn SGK.
