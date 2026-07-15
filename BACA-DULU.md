# PATCH — HANYA file yang berubah dari sesi ini

⚠️ Ini BUKAN seluruh project — cuma file yang benar-benar saya edit. Jangan
timpa folder `frontend/` atau `backend/` secara utuh, cukup salin file-file
di bawah ini SATU PER SATU ke lokasi yang sama persis di project Anda.

## File yang MENIMPA (sudah ada di project Anda, tinggal ganti isinya)

**Frontend:**
- `frontend/components/layout/Navbar.tsx` — fix hamburger menu HP
- `frontend/components/product/ProductCard.tsx` — fix tombol "+Keranjang" kepotong
- `frontend/components/product/ProductPurchasePanel.tsx` — fix badge diskon keluar kotak
- `frontend/components/cart/CartItemRow.tsx` — fix nama produk panjang dorong tombol keluar
- `frontend/app/chat/page.tsx` — fix responsive live chat
- `frontend/hooks/useAdmin.ts` — polling status order otomatis di admin
- `frontend/next.config.js` — izinkan domain gambar lebih luas
- `frontend/components/admin/ProductForm.tsx` — upload gambar produk
- `frontend/components/admin/BannerModal.tsx` — upload gambar banner
- `frontend/components/admin/PromotionModal.tsx` — upload gambar promo

**Backend:**
- `backend/src/app.ts` — fix trust proxy Railway
- `backend/src/controllers/payment.controller.ts` — fix DANA transaction_id
- `backend/src/controllers/order.controller.ts` — kirim internalOrderId
- `backend/src/services/midtrans.service.ts` — fix DANA + redirect setelah bayar
- `backend/src/repositories/product.repository.ts` — fix filter kategori salah
- `backend/src/config/env.ts` — tambah SUPABASE_STORAGE_BUCKET

## File yang BARU (belum ada di project Anda, perlu ditambahkan)

- `frontend/components/ui/ImageUploader.tsx`
- `frontend/services/upload.service.ts`
- `backend/src/routes/admin/upload.routes.ts`

⚠️ Untuk `backend/src/app.ts` — SAYA SUDAH PASTIKAN file ini sesuai dengan
struktur import Anda yang punya `settings.routes`, `admin/report.routes`,
dll. Tapi kalau setelah ini project Anda punya route/import lain yang TIDAK
ADA di file ini, JANGAN timpa — kirim ke saya dulu isi `app.ts` Anda yang
sekarang biar saya gabungkan dengan aman.

## Setelah menyalin semua file di atas:

```bash
# Cek dulu tidak ada error sebelum push
cd frontend && npm run build
cd ../backend && npm run build

# Kalau sukses:
git add .
git commit -m "fix: mobile responsive + payment fixes"
git push

cd backend
npx @railway/cli up
```
