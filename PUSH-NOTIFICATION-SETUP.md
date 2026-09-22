# Bugfix "Bayar Sekarang" + Fitur Web Push Notification

## 1. Fix bug "Bayar Sekarang" (terjadi kesalahan pada server)

**Penyebab:** Midtrans menolak bikin transaksi Snap baru dengan `order_id`
yang sama persis dengan transaksi sebelumnya. `resumePayment` kemarin pakai
`order_number` asli, jadi selalu ditolak Midtrans.

**Fix:** sekarang generate `order_id` baru (order_number + suffix unik)
tiap kali "Bayar Sekarang" diklik, disimpan di kolom baru
`payments.midtrans_order_id`, dan webhook pembayaran punya fallback untuk
tetap menemukan order yang benar walau `order_id` dari notifikasi Midtrans
bukan `order_number` asli.

**Wajib jalankan dulu** (Supabase SQL Editor):
```sql
-- isi dari database/migrations/002_add_midtrans_order_id.sql
```

## 2. Setup Web Push Notification

### a) Jalankan migration
Jalankan isi `database/migrations/003_push_subscriptions.sql` di Supabase SQL Editor.

### b) Tambah env var di backend (Railway)
VAPID key ini **sudah saya generate**, aman langsung dipakai (unik, belum
pernah dipublikasikan di tempat lain). **Jangan generate ulang** setelah ini
kalau sudah ada user yang subscribe — nanti subscription lama jadi tidak
valid.

```
VAPID_PUBLIC_KEY=BGM-fSo1F_2CCfiliMrNGXPc2PEcBtDLNjVK7CQ4n4wTrmR6-V4NewtGznt3UeLyrOWJrO9q1fytHI1LvaaHTU4
VAPID_PRIVATE_KEY=YrR1T7locAfqncB8B_rMIFqtwqrllzSK29fJwWfPJfs
VAPID_SUBJECT=mailto:admin@foodmart.id
```

### c) Install dependency backend
`web-push` sudah ditambahkan ke `backend/package.json` — tinggal jalankan
`npm install` sebelum deploy (Railway otomatis jalanin ini saat build,
tapi kalau develop lokal jalankan manual).

### d) File yang perlu ditimpa/ditambah
Lihat daftar lengkap di bawah — semuanya sudah saya siapkan.

## Cara pakai (setelah deploy)

1. Buka halaman **Profil** → scroll ke bagian **"Notifikasi Push"** →
   toggle-nya diaktifkan.
2. Browser akan minta izin notifikasi — klik **Allow/Izinkan**.
3. Coba: buat order baru, atau minta admin balas ulasan/chat kamu — notifikasi
   native harusnya muncul walau tab FoodMart tidak sedang dibuka.

## Catatan penting

- **iOS Safari**: Web Push baru didukung iOS 16.4+, dan **wajib** situsnya
  di-"Add to Home Screen" dulu (install sebagai PWA) baru notifikasi bisa
  muncul — ini keterbatasan Apple, bukan bug di kode kita.
- Kalau user block/uninstall, backend otomatis membersihkan subscription
  yang sudah mati dari database (tidak akan terus-terusan gagal kirim).
- Push terintegrasi otomatis ke SEMUA notifikasi yang sudah ada (order,
  payment, review, promo broadcast) — tidak perlu ubah kode lain, karena
  disambungkan di titik pusat (`notificationRepository.create()`).
