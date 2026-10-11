# Security checklist

- Use Supabase Auth; never store passwords/PINs as plaintext.
- Role authorization must use `profiles.role` and RLS, not editable client metadata.
- Keep `OPENAI_API_KEY` and any service-role key server-only; never commit secrets.
- Run `supabase/schema_full.sql` only for a new database, or run the additive V11 migration on an existing V1–V10 database. Back up first and test on staging.
- Storage buckets for library assets and student submissions are private. Do not change them to public without reviewing all object policies.
- Upload only files the school/user owns or is licensed to share; keep file-size and MIME-type limits.
- Exam scores and game rewards should be written by server-side RPCs; client-side fullscreen/tab detection is not tamper-proof.
- Chat policies restrict class messages to the user's class, and private messages require conversation membership. Review RLS before adding new routes.
- The initial admin role must be granted manually to a verified owner account; never automatically promote every new account.
- Protect minors' personal information in external AI, design, and video services; do not upload identifiable student work/media without appropriate permission.
