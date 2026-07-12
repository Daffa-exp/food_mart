# FoodMart — Full Stack Ecommerce Platform

Rebuild pixel-perfect dari desain Figma, dengan arsitektur enterprise-ready.
**Status: Fase 1–6 selesai — customer side + Admin Panel lengkap.**

> 🚀 **Mau hosting frontend + backend sekaligus?** Lihat [`DEPLOY.md`](./DEPLOY.md)
> — panduan deploy 1 langkah ke Render pakai `render.yaml` yang sudah disiapkan.

---

## ✅ SIAP JALAN — HANYA 2 HAL YANG PERLU DIEDIT

Seluruh kode sudah lengkap dan sudah diverifikasi bisa build tanpa error.
Yang perlu Anda isi **hanya kredensial Supabase & Midtrans**, di 2 file `.env`:

1. **`frontend/.env.local`** (copy dari `frontend/.env.example`)
2. **`backend/.env`** (copy dari `backend/.env.example`)

Setelah itu tinggal `npm install` + `npm run dev` di kedua folder. Detail lengkap
langkah demi langkah ada di bagian **🚀 Setup Awal** di bawah — termasuk cara
bikin akun Super Admin pertama (langkah yang paling sering terlewat).

---

## 📁 Struktur Proyek

```
foodmart/
├── frontend/          Next.js 15 (App Router, TypeScript, Tailwind, Framer Motion)
│   ├── app/            Semua halaman customer + /admin/*
│   ├── components/     UI components + admin components
│   ├── hooks/          React Query hooks (products, cart, admin, dst)
│   ├── services/       API client & service layer per domain
│   ├── types/          Tipe TypeScript kanonis
│   ├── utils/          Helper, validasi Zod, pricing preview
│   ├── providers/      React Query + Auth initializer
│   ├── store/          Zustand (cart, auth)
│   └── public/
├── backend/           Express.js + TypeScript
│   └── src/
│       ├── controllers/    Termasuk sub-folder tidak ada — semua flat + admin terpisah di routes/admin
│       ├── routes/
│       │   └── admin/      Seluruh route Admin Panel (requireAdmin/requireSuperAdmin)
│       ├── middlewares/     auth.middleware.ts (optionalAuth/requireAuth/requireAdmin/requireSuperAdmin)
│       ├── services/        Midtrans Snap service
│       ├── repositories/    Akses database (Supabase service role)
│       ├── config/          env.ts, supabase.ts
│       ├── validators/      Zod schema per resource
│       └── types/
└── database/           Supabase PostgreSQL
    ├── migrations/
    │   ├── 001_initial_schema.sql     Semua tabel, PK/FK/index
    │   ├── 002_rls_policies.sql       Row Level Security
    │   ├── 003_functions.sql          decrement/restore stock (atomik)
    │   ├── 004_auth_trigger.sql       Auto-sync auth.users -> public.users
    │   ├── 005_extend_products.sql    Kolom detail produk + composition jadi array
    │   └── 006_fix_product_images.sql Perbaikan URL foto produk (jalankan kalau sudah pernah seed)
    └── seed/
        └── seed_data.sql              8 produk contoh dengan UUID fixed
```

---

## 🚀 Setup Awal

### 1. Database (Supabase)
1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan berurutan (satu per satu, tunggu sampai sukses):
   - `database/migrations/001_initial_schema.sql`
   - `database/migrations/002_rls_policies.sql`
   - `database/migrations/003_functions.sql`
   - `database/migrations/004_auth_trigger.sql`
   - `database/migrations/005_extend_products.sql`
   - `database/seed/seed_data.sql`
   - `database/migrations/006_fix_product_images.sql`

   **Kalau project Supabase Anda sudah pernah dipakai sebelumnya** (sudah pernah
   jalankan seed sebelum update ini): cukup jalankan `006_fix_product_images.sql`
   saja untuk memperbaiki foto — tidak perlu ulang dari 001, dan aman (tidak
   menghapus produk/order/user yang sudah ada).
3. Salin `Project URL`, `anon key`, dan `service_role key` dari **Settings → API**.
4. **Aktifkan Email Auth**: Authentication → Providers → pastikan "Email" aktif.
   Untuk testing, matikan "Confirm email" di Authentication → Settings supaya
   tidak perlu verifikasi email dulu (aktifkan lagi saat production).

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # <-- EDIT: isi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
npm run dev
```

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env         # <-- EDIT: isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY
npm run dev
```

### 4. Midtrans Sandbox
1. Daftar di [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com).
2. Ambil `Server Key` dan `Client Key` dari menu Settings → Access Keys.
3. **Untuk testing webhook di localhost**, backend Anda perlu bisa diakses publik.
   Pakai [ngrok](https://ngrok.com) atau serupa: `ngrok http 4000`, lalu set
   URL notifikasi di Midtrans Dashboard → Settings → Configuration ke:
   `https://<subdomain-ngrok-anda>.ngrok-free.app/api/payments/notification`
4. Saat go-live: ganti key ke Production, `MIDTRANS_IS_PRODUCTION=true`, dan
   update URL notifikasi ke domain production — arsitektur sudah dirancang
   agar tidak perlu ubah kode sama sekali.

**Kartu kredit test Midtrans Sandbox** (dari dokumentasi resmi Midtrans):
Nomor `4811 1111 1111 1114`, CVV `123`, Expiry bebas tanggal masa depan, OTP `112233`.

### 5. Membuat Akun Super Admin Pertama (WAJIB untuk akses Admin Panel)

Admin Panel (`/admin/login`) memakai akun terpisah dari customer, disimpan di
tabel `admins`. Tidak ada halaman "Daftar Admin" publik (memang sengaja, demi
keamanan).

**Cara termudah — 1 perintah** (dari folder `backend/`, pastikan `.env` sudah
diisi `SUPABASE_SERVICE_ROLE_KEY`):
```bash
npm run create-admin -- admin@foodmart.id PasswordAman123 "Nama Admin"
```
Ini langsung membuat akun Supabase Auth (otomatis terverifikasi, tidak perlu
klik link email) sekaligus mendaftarkannya sebagai `super_admin`. Aman
dijalankan berkali-kali — kalau emailnya sudah pernah dipakai, akun yang ada
tinggal dipromosikan jadi super_admin.

Setelah itu langsung login di `/admin/login` dengan email + password yang
sama. Admin lain bisa dibuat langsung dari **Admin Panel → Admin Management**
(tidak perlu command line lagi).

<details>
<summary>Cara manual lewat SQL (kalau tidak bisa menjalankan command line, mis. Supabase project di server terpisah)</summary>

1. Daftar akun biasa dulu lewat `/register` di sisi customer (pakai email yang
   ingin dijadikan admin). Ini akan membuat baris di `auth.users` + `public.users`
   otomatis lewat trigger `004_auth_trigger.sql`.
2. Buka **SQL Editor** di Supabase, jalankan (ganti email-nya):
   ```sql
   insert into admins (auth_id, full_name, email, role)
   select auth_id, full_name, email, 'super_admin'
   from users
   where email = 'email-anda@contoh.com';
   ```
3. Login di `/admin/login` dengan email + password yang sama seperti langkah 1.
</details>

Setelah punya 1 super_admin, admin lain bisa dibuat langsung dari
**Admin Panel → Admin Management** (tidak perlu SQL manual lagi).

---

## 🗺️ Roadmap Pengerjaan (per Fase)

| Fase | Cakupan | Status |
|------|---------|--------|
| 1 | Project setup: struktur folder, config, database schema + RLS + seed | ✅ Selesai |
| 2 | Halaman Auth (Login/Register) + Home | ✅ Selesai |
| 3 | Menu, Product Detail, Cart | ✅ Selesai |
| 4 | Checkout + integrasi Midtrans Snap (sandbox) + Payment Success | ✅ Selesai |
| 5 | Order History, Profile, Wishlist, Notifications, Search, 404 + wiring Auth & Product API sungguhan | ✅ Selesai |
| 6 | Admin Panel lengkap (Dashboard, CRUD Produk/Kategori/dst) | ✅ Selesai |

## 🎨 Design Tokens

Warna diekstrak langsung dari screenshot Figma — lihat `frontend/tailwind.config.ts`:
- `primary.500` (#F5821F) — tombol utama, badge, link aktif
- `accent.500` (#C1272D) → `accent.300` (#E4572E) — gradient Hero section
- `surface.cream` (#FFF8F1) — background section & breadcrumb bar
- `success.500` (#16A34A) — status berhasil

## 🧩 Fase 3 — Menu, Product Detail, Cart

Halaman: `/menu`, `/menu/[slug]`, `/keranjang`. State management client-side pakai
Zustand + persist ke localStorage untuk cart (`store/cart-store.ts`).

Catatan teknis: Navbar memakai pola *mounted guard* (`hooks/useHasMounted.ts`)
untuk menghindari hydration mismatch Next.js karena badge count berasal dari
state yang di-hydrate dari localStorage.

## 🧾 Fase 4 — Checkout, Midtrans Snap, Payment Success

**Backend** (`/api/orders`, `/api/payments`):
- `orderController.createOrder` — **mengambil ulang harga & stok dari database**
  (tidak pernah percaya harga dari client), mendukung **guest checkout** maupun
  user login, hitung kupon, generate Snap token dari Midtrans.
- `paymentController.handleNotification` — webhook Midtrans: verifikasi
  `signature_key` (SHA512), **double-check status langsung ke Midtrans API**,
  update status payment+order, kurangi stok otomatis via function SQL
  `decrement_product_stock` saat `settlement`.

**Frontend**: `/checkout` (form + pilih delivery + kode promo + trigger Snap
popup asli via `hooks/useMidtransSnap.ts`), `/checkout/berhasil` (data order
asli dari backend + status stepper dinamis).

## 🔐 Fase 5 — Auth Sungguhan, Product API, Order History, Profile, Wishlist, Notifikasi, Search, 404

**Auth**: `store/auth-store.ts` (signIn/signUp/signOut sungguhan via Supabase Auth,
sinkron via `onAuthStateChange`), trigger `004_auth_trigger.sql` auto-sync
`auth.users` → `public.users`.

**Product & Category API**: `GET /api/products` (filter/sort/search/pagination),
`GET /api/products/:slug` (+ `relatedProducts`), `GET /api/categories`. Semua
halaman customer fetch dari API sungguhan lewat React Query (`hooks/useProducts.ts`).

**Halaman**: `/orders`, `/profile`, `/wishlist`, `/notifikasi`, `/search`, `/not-found`
— dilindungi `components/auth/RequireAuth.tsx` untuk yang butuh login.

## 🛠️ Fase 6 — Admin Panel Lengkap

Semua route di bawah prefix `/api/admin/*`, di-guard middleware `requireAdmin`
(cek tabel `admins`, bukan sekadar user biasa) — beberapa khusus `requireSuperAdmin`.

**Halaman Admin Panel** (`/admin/*`), semua terhubung ke backend sungguhan:

| Halaman | Fitur |
|---------|-------|
| `/admin` (Dashboard) | Revenue 30 hari, order status counts, chart tren 14 hari (Recharts), produk terlaris, order terbaru |
| `/admin/orders` + `/admin/orders/[id]` | List + filter status/search, detail order, ubah status (otomatis kembalikan stok kalau dibatalkan) |
| `/admin/products` + `new` + `[id]/edit` | CRUD penuh, toggle aktif/nonaktif, kelola gambar & komposisi |
| `/admin/categories` | CRUD via modal, pilih icon |
| `/admin/customers` | List customer, toggle aktif/nonaktif akun |
| `/admin/reviews` | Balas ulasan, toggle tampil/sembunyikan |
| `/admin/promotions` | CRUD banner promosi musiman |
| `/admin/coupons` | CRUD kupon (percentage/fixed/free shipping), tracking pemakaian |
| `/admin/banners` | CRUD banner homepage |
| `/admin/inventory` | Lihat & sesuaikan stok langsung, filter stok menipis |
| `/admin/reports` | Rekap penjualan per rentang tanggal, **Export Excel (CSV)** & **Export PDF** (print-to-PDF browser) |
| `/admin/payments` | Riwayat semua transaksi Midtrans |
| `/admin/settings` | Info toko, ongkos kirim, biaya layanan (tersimpan di tabel `settings`) |
| `/admin/profile` | Profil admin sendiri + ganti password |
| `/admin/admins` | CRUD akun admin lain — **khusus Super Admin**, otomatis buat akun Supabase Auth baru |

**Login Admin** (`/admin/login`) terpisah dari customer, tapi memakai mesin Auth
yang sama (Supabase Auth) — bedanya, setelah login berhasil, frontend memverifikasi
role lewat `GET /api/admin/me`; kalau bukan admin, otomatis di-sign-out lagi dari
konteks admin (lihat langkah **Setup Awal #5** untuk bikin akun pertama).

**Keamanan tambahan Fase 6**:
- Hapus produk yang sudah pernah dipesan akan ditolak dengan pesan jelas
  (FK constraint `on delete restrict`) — sarankan nonaktifkan saja.
- Admin tidak bisa menghapus akunnya sendiri.
- Membuat/menghapus admin otomatis membuat/menghapus user Supabase Auth-nya juga
  (pakai Admin API, butuh service role key).

**Keterbatasan yang disengaja** (demi menjaga scope realistis):
- Ongkir/biaya layanan di `/admin/settings` tersimpan ke database, tapi backend
  checkout (`backend/src/utils/pricing.ts`) masih pakai nilai konstan — belum
  otomatis baca dari tabel `settings`. Ada komentar `TODO` di file tersebut untuk
  titik penyambungannya.
- Upload gambar produk/banner masih via input URL (belum ada upload file ke
  Supabase Storage) — tempel URL gambar yang sudah ada (mis. dari Unsplash atau
  hasil upload manual ke Supabase Storage Dashboard).
- `/tentang-kami` dan `/kontak` sudah dibuat lengkap (lihat bagian "Update Terbaru"
  di bawah) — semua link Navbar customer sekarang punya halaman tujuan.

## 🩹 Update Terbaru (Bug Fixes & Fitur Tambahan)

**Perbaikan bug:**
- **Foto produk tidak sesuai** — semua URL gambar diganti dengan foto yang sudah diverifikasi manual satu per satu (cek halaman Unsplash aslinya), bukan tebakan dari memori lagi. Kalau Anda sudah pernah menjalankan `seed_data.sql`, jalankan `database/migrations/006_fix_product_images.sql` untuk memperbaiki data yang sudah ada (aman, tidak menghapus produk/order).
- **CRUD Admin Panel gagal tanpa pesan jelas** — akar masalahnya: setiap error validasi (Zod) selalu dibalas sebagai *"Terjadi kesalahan pada server"* generik, menyembunyikan pesan asli (mis. "URL gambar tidak valid"). Sekarang `backend/src/middlewares/errorHandler.ts` menangani `ZodError` secara khusus dan menampilkan pesan spesifik per field. Validasi URL gambar/banner/promosi juga dibuat lebih toleran (auto-trim spasi, boleh dikosongkan kalau memang opsional).
- Kalau setelah update ini masih ada CRUD yang gagal, sekarang pesan error di toast akan menyebutkan **field & alasan spesifiknya** — kirimkan pesan itu untuk diagnosa lebih lanjut.

**Perubahan kebijakan akses:**
- **Checkout sekarang WAJIB login.** Guest checkout sengaja dimatikan — customer yang belum login hanya bisa melihat-lihat (Home/Menu/Product Detail/Cart), begitu klik "Lanjutkan ke Checkout" akan diarahkan ke prompt login dulu. Lihat `backend/src/routes/order.routes.ts` (`requireAuth`) dan `frontend/app/checkout/page.tsx` (`RequireAuth`).

**Fitur baru:**
- **Halaman Tentang Kami** (`/tentang-kami`) — cerita singkat, statistik, visi & misi, nilai-nilai perusahaan, dan komitmen pengiriman. Foto yang dipakai sudah diverifikasi gratis (Unsplash License biasa, bukan Unsplash+ berbayar).
- **Halaman Customer Support** (`/kontak`) — informasi jam operasional, email, dan lokasi, dengan tombol menuju **Live Chat** (`/chat`).
- **Live Chat** (`/chat`) — placeholder sistem chat internal (daftar percakapan, area chat, input pesan, empty state). Tombol "Chat Penjual" di halaman Detail Produk, Checkout, dan Detail Pesanan juga mengarah ke sini. Fitur WhatsApp sudah sepenuhnya dihapus dari proyek ini.
- **Alamat Tersimpan** — customer bisa simpan beberapa alamat pengiriman di halaman Profile (`components/profile/SavedAddressesSection.tsx`), lalu tinggal pilih salah satunya saat checkout (`components/checkout/SavedAddressPicker.tsx`) tanpa ketik ulang. Backend: `backend/src/routes/address.routes.ts`.
- **Animasi tambahan**: page transition halus di semua halaman (`app/template.tsx`), semua modal Admin Panel pakai animasi fade+scale konsisten (`components/ui/AnimatedModal.tsx`), banner login/register autoplay dengan crossfade, angka di Dashboard admin animasi count-up, sidebar admin stagger masuk, floating tombol scroll-to-top di semua halaman.

## 🔒 Keamanan yang Sudah Diterapkan

- Row Level Security (RLS) di setiap tabel Supabase — user hanya bisa akses data
  miliknya, admin punya akses penuh lewat fungsi `is_admin()`.
- Backend: Helmet, CORS whitelist, rate limiter, HPP, XSS-clean, validasi env dengan Zod.
- Service role key backend tidak pernah diekspos ke client.
- Semua endpoint admin di-guard `requireAdmin`/`requireSuperAdmin`, diverifikasi
  lewat smoke test (401 tanpa token, bukan crash).
- Harga & stok saat checkout selalu dihitung ulang dari database, tidak pernah
  dipercaya dari payload client.
