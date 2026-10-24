# KHTN SỐ — Gói rà soát và cập nhật bổ sung (nhánh main)

Gói này được tạo từ mã nguồn trong `KHTNSO-main (2)(2).zip` do người dùng cung cấp. Đây là bản vá cho website hiện có, không phải website mới.

## Kết quả rà soát mã nguồn

1. **Phòng Thực Hành:** trước đây thanh điều hướng và trang chủ tách `/practice` và `/simulations`. Giao diện điều hướng được gom thành một phòng có ba khối; `/simulations` vẫn tồn tại như trang tương thích để không làm hỏng liên kết cũ. Các công cụ đo lường, báo cáo Cloud/CSV/PDF và các mô phỏng hiện có được giữ nguyên.
2. **Phòng trưng bày:** mã nguồn gốc chưa có phòng gallery chuyên biệt. Bổ sung `/gallery`, `/admin/gallery` và migration additive. Hỗ trợ kệ hình ảnh, video, sản phẩm STEM; bình chọn 1–5 sao; giáo viên/admin chấm ba tiêu chí 0–10. Điểm tổng hợp công khai qua RPC chỉ trả trung bình/số lượt, không tiết lộ danh tính người bình chọn/giám khảo.
3. **Mẫu Excel ngân hàng câu hỏi:** các cột đã có cho MCQ, Đúng/Sai, trả lời ngắn, tự luận, nhưng mẫu minh họa chỉ có MCQ. Đã bổ sung bốn ví dụ, sheet hướng dẫn và cột mã môn/bộ sách/mức độ. Import/export hỗ trợ các trường này.
4. **Liên kết ma trận/đề/Game:** tăng cường lọc theo mã môn, hỗ trợ mã môn cũ và trạng thái `published`/`public`; đề mới lưu `subject_code`, `book_code`, `matrix_snapshot`, `scoring_snapshot` trên các cột V15 hiện có. Không thay RPC chấm Game phía máy chủ.
5. **AI Teacher:** trang gọi nhầm `/api/ai/exam/matrix`, trong khi route có trong source là `/api/ai/teacher`; đã sửa đường gọi. Tạo câu hỏi AI giờ lưu `subject_code`, `book_code`, và metadata `tf_items` nếu AI trả đủ ý. Giao diện thêm lựa chọn môn/bộ sách.
6. **Gemini:** gateway AI hiện hỗ trợ lựa chọn provider nhưng giữ nguyên hàm gọi và hợp đồng trả về hiện có. Mặc định vẫn dùng OpenAI như trước. Để chuyển sang Gemini, cấu hình thêm `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, `GEMINI_MODEL` trong môi trường triển khai. Khi có model Gemini mới, chỉ đổi giá trị `GEMINI_MODEL`; không cần đổi route hoặc cấu trúc dữ liệu. Các biến môi trường OpenAI/Supabase hiện có không bị đổi tên hay xóa.

## Các tệp trong gói

### Tệp được cập nhật
- `src/lib/data.ts`
- `src/components/Shell.tsx`
- `src/app/page.tsx`
- `src/app/practice/page.tsx`
- `src/app/simulations/page.tsx`
- `src/app/admin/exams/page.tsx`
- `src/app/admin/exam-builder/page.tsx`
- `src/app/admin/game/page.tsx`
- `src/app/admin/page.tsx`
- `src/lib/server/ai.ts`
- `src/app/ai/teacher/page.tsx`
- `src/app/api/ai/question/route.ts`

### Tệp mới
- `src/app/gallery/page.tsx`
- `src/app/admin/gallery/page.tsx`
- `supabase/migrations/20261024_gallery_additive.sql`

## Cách cập nhật an toàn vào GitHub `main`

1. Sao lưu repository hiện tại hoặc tạo branch thử nghiệm tạm thời trước khi merge.
2. Trong repository hiện có, checkout/chọn nhánh `main`.
3. Giải nén ZIP vào thư mục gốc repository, giữ nguyên đúng đường dẫn `src/...` và `supabase/...`. Chỉ cập nhật các tệp liệt kê trên; không thay các tệp khác.
4. Mở Supabase SQL Editor của **đúng dự án đang kết nối với Vercel** và chạy riêng `supabase/migrations/20261024_gallery_additive.sql`. Migration chỉ tạo bảng/index/policy/function mới cho Gallery; không drop/rename bảng cũ.
5. Commit các thay đổi lên `main`, chờ Vercel triển khai.
6. Kiểm tra:
   - `/practice` và `/simulations`
   - `/gallery` và `/admin/gallery`
   - `/admin/exams` → tải mẫu Excel, xác nhận có 4 loại câu hỏi và sheet hướng dẫn
   - `/admin/exam-builder` và `/admin/game`
   - `/ai/teacher` → thử tạo câu hỏi và ma trận
   - `/api/health` nếu dự án đã dùng endpoint này

## Kiểm thử và giới hạn

- Đã chạy trình transpile TypeScript/JSX của repository: **73 tệp, không phát hiện lỗi cú pháp**.
- Chưa thể xác nhận `next build` thành công vì ZIP nguồn không chứa `node_modules`; chưa kết nối/kiểm thử Supabase hoặc Vercel thực tế.
- Chưa thay đổi bất kỳ biến môi trường đang tồn tại và không thực hiện thao tác trên repository/GitHub của người dùng.
- Các tệp AI vẫn cần provider API key hợp lệ; Gemini phải được bật rõ ràng bằng `AI_PROVIDER=gemini`. Không tự động đổi nhà cung cấp để tránh làm thay đổi hành vi hiện tại.
