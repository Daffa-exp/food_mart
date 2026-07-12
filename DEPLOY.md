# Deploy FoodMart (Frontend + Backend Sekaligus) ke Render

Panduan ini pakai **Render Blueprint** (`render.yaml` di root repo) — 1 kali proses,
Render otomatis bikin 2 service (backend + frontend) yang saling terhubung
sendiri, tanpa acara "deploy dulu, baru tau URL-nya, baru di-set manual, baru
redeploy".

## Yang perlu disiapkan dulu

Kumpulkan ini sebelum mulai (semuanya sudah ada kalau project sudah jalan di
lokal, tinggal buka file `.env` masing-masing):

**Dari `backend/.env`:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`

**Dari `frontend/.env.local`:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Langkah-langkah

1. **Push project ke GitHub** (kalau belum pernah):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <url-repo-github-anda>
   git push -u origin main
   ```

2. **Buka [Render Dashboard](https://dashboard.render.com/)** → klik **New** →
   **Blueprint**.

3. Connect akun GitHub Anda (kalau belum), pilih repo FoodMart ini.

4. Render otomatis mendeteksi `render.yaml` di root dan menampilkan preview:
   akan membuat 2 service — `foodmart-backend` dan `foodmart-frontend`.

5. Render akan minta Anda isi 6 env var yang sifatnya rahasia (yang ditandai
   `sync: false` di `render.yaml`) — isi sesuai daftar di atas. Sisanya
   (`CLIENT_URL`, `NEXT_PUBLIC_API_BASE_URL`) **otomatis terisi sendiri**,
   tidak perlu diapa-apakan.

6. Klik **Deploy Blueprint**. Tunggu proses build (~3-5 menit untuk keduanya).

7. Setelah kedua service status-nya **Live**, buat akun admin pertama:
   - Di Render Dashboard → buka service `foodmart-backend` → tab **Shell**
   - Jalankan:
     ```bash
     npm run create-admin -- admin@foodmart.id PasswordAman123 "Nama Admin"
     ```

8. Selesai. Buka URL `foodmart-frontend` yang Render kasih (bentuknya
   `https://foodmart-frontend-xxxx.onrender.com`) — itu link toko Anda yang
   bisa dibagi ke siapa saja.

## Yang perlu diingat (free tier)

- **Kedua service tidur setelah 15 menit tidak ada trafik**, dan butuh
  30-60 detik buat "bangun" lagi pas ada yang buka. Wajar untuk demo/testing,
  tapi kalau mau dipakai serius, upgrade ke plan **Starter** ($7/bulan per
  service) di Render Dashboard supaya tidak ada delay ini.
- `MIDTRANS_IS_PRODUCTION` di-set `"false"` (masih mode Sandbox/testing).
  Begitu siap terima pembayaran asli, ganti jadi `"true"` di
  `foodmart-backend` → **Environment**, dan ganti `MIDTRANS_SERVER_KEY` /
  `MIDTRANS_CLIENT_KEY` dengan Production Key dari Dashboard Midtrans.
- Migration & seed database (`database/migrations/*.sql`,
  `database/seed/seed_data.sql`) **tidak otomatis jalan** lewat Blueprint ini
  — itu tetap dijalankan manual satu kali lewat Supabase SQL Editor seperti
  biasa (lihat bagian Setup di README utama), karena database-nya di
  Supabase, bukan di Render.

## Kalau mau ubah nama service

Nama `foodmart-backend` / `foodmart-frontend` di `render.yaml` menentukan
subdomain `.onrender.com`-nya. Kalau nama itu sudah dipakai orang lain di
Render, ganti saja nilainya di `render.yaml` (field `name:` di kedua
service) sebelum deploy — cukup pastikan referensi `fromService.name` di
service yang satunya ikut disesuaikan juga.

## Troubleshooting

- **Build gagal di frontend dengan error terkait Supabase**: pastikan
  `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah keisi
  benar di tab Environment service `foodmart-frontend`.
- **Checkout gagal / CORS error**: cek tab Environment service
  `foodmart-backend`, pastikan ada env var `FRONTEND_HOST` (otomatis dari
  `fromService`) — kalau kosong, klik **Manual Deploy > Clear build cache &
  deploy** di kedua service supaya blueprint di-sync ulang.
- **Halaman "Pembayaran Berhasil" nyasar/error**: pastikan backend tidak
  crash saat start (cek tab **Logs**) — biasanya karena salah satu secret
  env var di atas belum terisi.
