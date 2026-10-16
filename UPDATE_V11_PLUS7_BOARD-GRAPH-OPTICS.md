# KHTN SỐ V11 PLUS7 — Teaching board fixes

## Changes
- Corrected the two school-level principal rays for converging and diverging thin lenses:
  1. Ray through optical centre O continues straight.
  2. Ray parallel to the principal axis refracts through F' for a converging lens; for a diverging lens, its backward extension passes through F.
- Removed an extra dashed image-construction line so the main diagram emphasizes the two requested principal rays.
- Corrected the source/cell symbol in the sample circuit with unequal parallel plates and explicit + / − polarity.
- Added coordinate entry for s–t, v–t and U–I graphs. Format: `0,0; 2,20; 4,40`.
- Coordinate-driven graphs display editable red points. In Select/Move mode, drag a red point to edit one coordinate, or drag a blue segment to move the plotted line without moving the axes/grid.
- Kept the existing Next.js routes, page layout, local save key, and project structure.

## Validation
- `node scripts/check-syntax.cjs`: passed (65 files, 0 syntax errors).
- Full `next build` could not be run in this workspace because dependencies were not installed (`next: not found`). `npm install` timed out. Run `npm install` and `npm run build` in the normal deployment environment before publishing.
