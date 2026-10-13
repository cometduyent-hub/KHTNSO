# KHTN SỐ V11+ — Changelog

## Giữ nguyên
- Giữ Next.js 14, React 18, cấu trúc `src/app`, `src/components`, `src/lib`, `supabase/` và các route hiện hữu.
- Không thêm thư viện mới và không sửa schema/migration Supabase.

## Bổ sung trong V11+
- Trình tạo đề có tìm kiếm câu hỏi và tìm kiếm đề.
- Lọc câu hỏi theo khối lớp và dạng câu (MCQ, đúng/sai, trả lời ngắn, tự luận).
- Chọn/bỏ chọn toàn bộ câu trong kết quả lọc.
- Thống kê số câu đã chọn và tổng điểm theo trường `points` của ngân hàng câu hỏi.
- Kiểm tra thời điểm đóng đề phải sau thời điểm mở đề.
- Thông báo rõ khi Supabase chưa cấu hình, truy vấn thất bại, hoặc ngân hàng không có câu hỏi `published`.
- Nếu gắn câu hỏi vào đề bị lỗi, tự thử xóa bản ghi đề vừa tạo để tránh đề nháp rỗng.
- Tìm kiếm đề đã có và xóa đề (có xác nhận; thao tác có thể bị RLS/quan hệ bài làm từ chối).

## Deploy
1. Giải nén ZIP, giữ nguyên thư mục `KHTNSO-main` làm thư mục gốc repository.
2. Giữ nguyên Environment Variables hiện có trên Vercel; không đưa khóa bí mật vào mã nguồn.
3. Không chạy migration lại chỉ vì dùng bản này: không có thay đổi schema. Nếu V11 migration chưa được áp dụng, cần sao lưu và kiểm tra staging trước khi chạy SQL.
4. Deploy qua GitHub/Vercel như V11.

## Kiểm tra đã thực hiện
- `node scripts/check-syntax.cjs`: 64 tệp TypeScript/TSX, 0 lỗi cú pháp.
- Chưa thể xác nhận `next build` hoặc typecheck đầy đủ trong môi trường này do các package của dự án chưa được cài đặt đầy đủ.
- Chưa chạy E2E với Supabase thật; quyền truy cập, dữ liệu, bucket, và chính sách RLS phụ thuộc cấu hình dự án của bạn.
