# KHTN SỐ V11 — Implementation & validation status

## Đã cập nhật trong source này

- CMS dashboard kiểm tra profile role và active state; đăng nhập chỉ tin vai trò trong `profiles`.
- CRUD curriculum qua Supabase.
- CRUD tài nguyên và upload/download qua private Storage bucket.
- Quản lý hồ sơ/role chỉ dành cho admin.
- Dashboard thống kê số lượng bản ghi và điểm trung bình thô.
- Teacher essay grading: điểm từng câu, nhận xét, tổng điểm, graded_by/graded_at.
- Student essay attachments and drawing pad; tệp lưu ở bucket riêng và có đường dẫn ký hạn để Review/staff xem.
- Review hiển thị điểm/nhận xét tự luận và tệp đính kèm.
- Measurement report: trung bình, sai số, CSV, print-to-PDF, lưu `lab_reports`/`lab_measurements`.
- Game challenge authoring, grade/level-gated sanitized question RPC, server-side scoring and one-time diamond rewards; 50-avatar catalog, buy/equip RPCs and anonymized leaderboard.
- Class management CRUD and membership assignment; profile class/grade sync.
- Class chat, reporting/moderation UI, direct conversations, direct message RPCs, class-scoped RLS.
- Creative Hub catalog and admin CRUD; schema seeds 15 external tools; homepage styling refresh.
- Exam time limit and open/close window fields in the builder; essay attachment upload and drawing pad.
- Additive V11 migration; hardening for attempts updates, chat scope, private uploads, and content publication controls.

## Các chức năng V1–V10 được giữ lại từ archive

- Question bank and exam builder/runtime/review.
- AI Tutor, AI Teacher Studio, AI question/exam generation, document/knowledge/RAG APIs, adaptive practice/learning paths, AI Master Teacher reports/interventions.
- Curriculum JSON for grades 6–12 and original routes.

## Chưa thể xác nhận / còn thiếu

- `npm install` timed out in the current environment. Syntax transpilation passed for all `.ts`/`.tsx` files at the time of the check, but a full TypeScript typecheck and `next build` were not completed.
- Migration has not been executed against the user's Supabase project; policies/functions must be tested on staging first.
- Need end-to-end tests with real teacher/student/admin accounts, uploaded files, exam attempts, essay scoring, chat, and game rewards.
- Full curriculum completeness/accuracy needs lesson-by-lesson verification against the actual Kết nối tri thức SGK/SBT sources; current `data/curriculum.json` is partial.
- A true Three.js/WebGL 3D instrument lab and natively built AC generator/electron-current/optics lab are not complete. Notifications/settings/content pages do not yet have comprehensive management UIs, and video hosting/editor are external links rather than native modules.
- AI upload parsing and all AI model/API behavior depend on valid server keys, model availability, provider limits, and actual deployment environment.

## Validation performed

- TypeScript/TSX syntax transpilation: 54 source files passed before the final additions; re-run is required for the final package.
- Full npm build: not run successfully (dependency installation timed out).
- Supabase integration: not run; no access to user's production project.
- Do not describe this package as production-certified until the checks above pass.

## V11+ bổ sung trong gói này (2026-10-13)

- Exam Builder: thêm lọc ngân hàng theo khối lớp/dạng câu, tìm kiếm nội dung, chọn/bỏ chọn toàn bộ kết quả lọc, tổng hợp số câu và tổng điểm, kiểm tra thời điểm mở/đóng đề, thông báo lỗi tải dữ liệu rõ hơn và nút tải lại.
- Exam Builder: nếu thêm câu vào đề thất bại sau khi tạo bản ghi đề, cố gắng xóa bản ghi nháp vừa tạo để tránh để lại đề rỗng; thêm tìm kiếm đề hiện có và thao tác xóa đề có xác nhận.
- Lưu ý: không thay đổi schema hay route hiện có. Các thao tác vẫn chịu quyền/RLS của Supabase; chưa được kiểm thử với dự án Supabase production của người dùng.
