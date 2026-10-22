# KHTN SỐ V20 — khôi phục đa phương tiện + 5 cuộc leo núi

## Tệp cập nhật (chỉ 2 tệp)
- `src/app/admin/exams/page.tsx`: giữ trường nhập ý a–d của câu Đúng/Sai và bổ sung dán ảnh từ clipboard vào ô Nội dung, chọn tệp ảnh/video/âm thanh, dán URL và ghi âm trực tiếp qua microphone.
- `src/app/game/page.tsx`: thêm 5 lựa chọn leo núi: KHTN, Anh văn, Toán, Văn sử địa, Tổng hợp.

## Cập nhật trên GitHub nhánh main
1. Sao lưu hai tệp hiện tại trong GitHub trước khi sửa.
2. Mở nhánh `main` của repository hiện có.
3. Thay đúng hai tệp theo cùng đường dẫn trong gói này; không xóa hoặc đổi tên tệp/bảng khác.
4. Commit vào `main`, đợi Vercel triển khai.

## Lưu ý kỹ thuật
- Không có thay đổi schema Supabase, không thêm package.
- Clipboard hỗ trợ ảnh được clipboard cung cấp dưới dạng tệp; URL có đuôi tệp ảnh/âm thanh/video được nhận diện khi dán vào ô Nội dung.
- Tệp nhỏ được nhúng dạng data URL trong `question_bank.media`. Đây là phương án tương thích schema hiện tại, nhưng không tối ưu cho video lớn; với tệp lớn nên lưu ở Supabase Storage hoặc dịch vụ lưu trữ được phép rồi dán URL. Nếu API/DB giới hạn kích thước payload, hãy dùng URL.
- Ghi âm cần cấp quyền microphone và trang chạy qua HTTPS (Vercel mặc định HTTPS). Dừng ghi sẽ đính kèm bản ghi âm.
- Năm lựa chọn môn học không thêm cột vào database. Để lọc đúng các thử thách, gắn nhãn môn học vào tiêu đề vòng trong CMS · Game, ví dụ `[KHTN] ...`, `[Anh văn] ...`, `[Toán] ...`, `[Văn sử địa] ...`. `Tổng hợp` hiển thị mọi thử thách đã xuất bản. Nếu chưa gắn nhãn, lựa chọn môn có thể hiện 0 vòng; không tự ý đổi dữ liệu hiện có.
- Cần kiểm tra sau deploy: thêm câu mới và câu Đúng/Sai, dán ảnh, chọn video/âm thanh, ghi âm, lưu/mở lại câu hỏi; mở `/game`, chọn từng môn và thử mở vòng.
- Chưa thể xác nhận build/deploy production từ môi trường này; cần theo dõi log Vercel sau commit.
