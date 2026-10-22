-- KHTN SỐ V16: additive-only fields for subject-specific curriculum.
-- No table is dropped, renamed, or truncated. Run on the existing Supabase project.
alter table public.curriculum add column if not exists subject_code text not null default 'KHTN';
alter table public.curriculum add column if not exists book_code text;
create index if not exists idx_curriculum_subject_grade_book on public.curriculum(subject_code, grade, book_code, sort_order);
-- Existing curriculum rows remain KHTN by default; populate other subjects only with verified syllabus data.
notify pgrst, 'reload schema';
