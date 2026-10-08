# KHTN SỐ – V4 implementation status

V4 builds on V3 without removing the existing rooms/routes.

## Implemented in V4
- Supabase question-bank CRUD for MCQ / True-False / short answer / essay.
- Explicit `exam_questions` composition table.
- Exam builder: select published questions -> create draft -> publish.
- Safe RPC `get_exam_questions`: students receive question content without answer keys.
- Real exam attempt persistence in `exam_attempts`.
- Objective server-side scoring for MCQ, True-False and short answer.
- Essay answers are stored for teacher grading; V4 does not yet implement teacher essay rubric/scoring UI.
- Attempt limit and open/close window checks in the student runtime.
- Visibility violation counter and auto-submit threshold.
- Review RPC and student Review page showing selected answers, correct answers and essay work after submission.

## Still not production-complete
- Teacher essay grading UI, attachments/drawings, and rubric.
- Full Excel import/export UI and storage upload/signed URLs.
- Three.js measurement laboratory and experiment report engine.
- Realtime chat/game.
- Full 6–12 curriculum verification lesson-by-lesson against source books.
- Automated CI build in a network-enabled npm environment.
- Stronger anti-cheat telemetry cannot make a browser absolutely tamper-proof.

## Deployment note
Apply the complete `supabase/schema.sql` to the target Supabase project before testing V4. The SQL is intentionally additive for V3 compatibility.
