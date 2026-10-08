# Security
- Use Supabase Auth; do not store passwords/PINs as plaintext.
- For student PIN login, implement a server-side PIN exchange to a short-lived session; hash/reset PINs.
- Keep service-role key server-only.
- Enable RLS on every student-facing table.
- Scope chat by class/channel.
- Store audit logs for admin actions and exam violations.
- Fullscreen/tab monitoring is not a guaranteed browser lock; treat it as evidence/automatic-submit trigger.
- Do not mirror third-party copyrighted simulations or videos unless license permits.
