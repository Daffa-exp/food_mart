# Deploy FoodMart ke Vercel (Frontend + Backend)

Backend ini pakai Express biasa, bukan Next.js API Routes — supaya bisa naik
ke Vercel, backend dibungkus jadi 1 serverless function lewat
`backend/api/index.ts` + `backend/vercel.json` (sudah disiapkan, tidak perlu
diubah).

Di Vercel, frontend dan backend didaftarkan sebagai **2 Project terpisah**
dari repo yang sama (beda `Root Directory`) — Vercel tidak punya fitur
"blueprint 1 file untuk banyak service" seperti Render, jadi ada 1x
tukar-menukar URL manual di awal. Ikuti urutan di bawah, jangan dibalik.

## Yang perlu disiapkan dulu

Dari `backend/.env`:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`

Dari `frontend/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Langkah 1 — Push ke GitHub (kalau belum)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <url-repo-github-anda>
git push -u origin main
```

## Langkah 2 — Deploy Backend dulu

1. Buka [vercel.com/new](https://vercel.com/new), import repo ini.
2. Di step **Configure Project**:
   - **Root Directory** → klik Edit, pilih folder **`backend`**
   - **Framework Preset** → biarkan "Other"
3. Buka **Environment Variables**, isi:
   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | dari `.env` lokal |
   | `SUPABASE_SERVICE_ROLE_KEY` | dari `.env` lokal |
   | `MIDTRANS_SERVER_KEY` | dari `.env` lokal |
   | `MIDTRANS_CLIENT_KEY` | dari `.env` lokal |
   | `MIDTRANS_IS_PRODUCTION` | `false` |
   | `CLIENT_URL` | isi sementara `http://localhost:3000` — nanti di Langkah 4 kita update |
4. Klik **Deploy**. Setelah selesai, Vercel kasih URL seperti
   `https://foodmart-backend-xxxx.vercel.app` — **catat URL ini**.
5. Tes: buka `https://foodmart-backend-xxxx.vercel.app/health` di browser,
   harus muncul respons JSON (bukan 404).

## Langkah 3 — Deploy Frontend

1. Balik ke [vercel.com/new](https://vercel.com/new), import repo yang **sama** sekali lagi (jadi Project baru terpisah).
2. **Root Directory** → pilih folder **`frontend`** (Vercel otomatis kenal Next.js).
3. Isi **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://foodmart-backend-xxxx.vercel.app/api` (URL dari Langkah 2 + `/api`) |
   | `NEXT_PUBLIC_SUPABASE_URL` | dari `.env.local` lokal |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dari `.env.local` lokal |
4. Klik **Deploy**. Setelah selesai, catat URL frontend-nya, misal
   `https://foodmart-xxxx.vercel.app`.

## Langkah 4 — Sambungkan balik: update CLIENT_URL di backend

1. Balik ke Project **backend** di Vercel → tab **Settings > Environment Variables**.
2. Edit `CLIENT_URL`, ganti dari `http://localhost:3000` jadi URL frontend
   dari Langkah 3 (`https://foodmart-xxxx.vercel.app`).
3. Buka tab **Deployments** → klik titik tiga (⋯) di deployment paling atas →
   **Redeploy** (supaya env var baru dipakai — Vercel tidak auto-redeploy
   cuma karena env var berubah).

## Langkah 5 — Daftarkan URL webhook Midtrans

Ini WAJIB supaya status pembayaran bisa berubah otomatis (settlement/gagal)
tanpa perlu refresh manual:

1. Buka [Midtrans Dashboard](https://dashboard.sandbox.midtrans.com/) (Sandbox) atau versi Production kalau sudah live.
2. **Settings > Configuration**.
3. Isi **Payment Notification URL** dengan:
   ```
   https://foodmart-backend-xxxx.vercel.app/api/payments/notification
   ```
4. Simpan.

Tanpa langkah ini, order akan selalu nyangkut di status "Menunggu Pembayaran"
walau customer sudah benar-benar bayar, karena Midtrans tidak tahu ke mana
harus lapor.

## Langkah 6 — Buat akun admin pertama

Vercel tidak punya fitur "Shell" interaktif kayak Render, jadi jalankan
perintah ini dari **komputer lokal Anda** (`backend/`), tapi arahkan ke
database production (isi `.env` lokal dengan `SUPABASE_URL` &
`SUPABASE_SERVICE_ROLE_KEY` yang SAMA dengan yang dipakai di Vercel):

```bash
cd backend
npm run create-admin -- admin@foodmart.id PasswordAman123 "Nama Admin"
```

Selesai. Buka URL frontend dari Langkah 3 — itu link toko Anda.

## Yang perlu diingat

- **Cold start**: fungsi serverless backend "tidur" saat tidak ada trafik dan
  perlu beberapa ratus milidetik–beberapa detik untuk "bangun" lagi saat ada
  request pertama. Jauh lebih cepat dibanding Render free tier (yang bisa
  30-60 detik), tapi tetap ada jeda kecil di request pertama.
- **Batas waktu eksekusi**: plan Hobby (gratis) Vercel membatasi tiap
  request maksimal ~10 detik. Fitur **Export Excel/PDF** di Reports admin
  men-generate file di server — kalau datanya sangat banyak (ribuan order
  sekaligus) berpotensi kena limit ini. Untuk pemakaian normal harusnya
  aman jauh di bawah batas itu.
- Setiap kali push ke branch utama di GitHub, **kedua Project di Vercel
  auto-redeploy sendiri** — tidak perlu redeploy manual lagi setelah setup
  awal ini selesai (kecuali ganti env var, itu tetap perlu redeploy manual
  sekali seperti Langkah 4).
- `MIDTRANS_IS_PRODUCTION` masih `false` (mode Sandbox/testing). Kalau siap
  terima pembayaran asli: ganti jadi `true` + ganti `MIDTRANS_SERVER_KEY` /
  `MIDTRANS_CLIENT_KEY` dengan Production Key, redeploy backend, dan ulangi
  Langkah 5 tapi di Midtrans Dashboard **Production** (bukan Sandbox).

## Troubleshooting

- **Frontend build gagal, error "supabaseUrl is required"**: env var
  `NEXT_PUBLIC_SUPABASE_URL` belum keisi di Project frontend, atau
  belum redeploy setelah diisi.
- **Checkout gagal / network error**: cek `NEXT_PUBLIC_API_BASE_URL` di
  Project frontend — harus persis URL backend + `/api` di akhir, tanpa
  trailing slash ganda.
- **Status order tidak pernah berubah otomatis**: cek Langkah 5 (Payment
  Notification URL). Bisa juga dicek manual: Midtrans Dashboard >
  Transactions > pilih transaksi > lihat log notifikasi, apakah statusnya
  "success" atau ada error (mis. 401/500 dari backend).
