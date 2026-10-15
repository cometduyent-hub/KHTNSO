# KHTN SỐ V11 PLUS6 — Interactive Board & AI fixes

## Changes
- Whiteboard: move objects; drag individual line endpoints; drag individual sampled vertices of hand-drawn paths; wires inserted as editable line segments; selected diagrams can be rotated 0–360 degrees and scaled.
- Optics: corrected convex/concave lens cross-sections and thin-lens image-distance/magnification direction; ray-color selector for monochromatic prism ray; water-to-air refraction orientation retained.
- Hand-drawn graph: each sampled vertex can be edited and the linked piecewise-slope description updates. The description is a coordinate-board approximation, not a calibrated physical equation until axis scale/units are configured.
- AI: changed invalid example/default model `gpt-5.6-luna` to `gpt-4.1-mini`; improved Responses API output-text extraction and empty-response error; fixed student practice submission route to pass the Request to `requireUser`; included `question_order` in student analysis query.
- Health endpoint reports only whether Supabase/OpenAI configuration is present and the model name; it never returns secret keys.

## Required deployment configuration
Set `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4.1-mini`, `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project. Re-deploy after saving environment variables. Ensure the project's `supabase/schema_full.sql` or applicable migrations have been applied.

## Validation scope
`node scripts/check-syntax.cjs` checks TS/TSX syntax transpilation. It is not a full TypeScript typecheck, Next.js production build, or live Supabase/OpenAI test.
