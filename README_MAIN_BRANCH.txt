KHTN SO - 3D ADDITIVE PATCH FOR MAIN BRANCH

Chi co 4 source files trong goi nay. Giai nen tai repository root, giu nguyen duong dan src/...

TAO MOI:
- src/components/three/ThreeLearningStudio.tsx

CAP NHAT (ghi de dung 3 file nay):
- src/app/game/page.tsx
- src/app/practice/page.tsx
- src/app/teaching-board/page.tsx

KHONG thay package.json, package-lock.json, next.config.*, vercel.json, .env*, thu muc supabase/, migrations, schema, RPC hay cac file khac.
Khong chay SQL. Khong tao project/repository moi.

Quy trinh an toan tren GitHub main:
1. Tao backup/branch sao luu main truoc khi thay doi.
2. Giai nen patch vao repository hien tai, tai root cua repository.
3. Kiem tra Git diff: chi 4 duong dan tren duoc them/sua.
4. Chay npm run build bang lockfile dang duoc repository su dung.
5. Chi commit va deploy neu build thanh cong.

Ghi chu: component tai Three.js tu CDNJS khi mo cac khu vuc 3D, can Internet. Day la lop giao dien 3D ban dau, chua phai mo phong do luong/thi nghiem da hieu chuan. Chua xac nhan build production hay tuong thich runtime tren Vercel trong goi nay.
