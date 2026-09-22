-- =========================================================
-- Tambah kolom untuk mendukung fitur "Bayar Sekarang" (resume payment)
-- Jalankan sekali lewat Supabase SQL Editor
-- =========================================================
--
-- KENAPA DIBUTUHKAN:
-- Midtrans TIDAK mengizinkan membuat transaksi Snap baru dengan order_id
-- yang sama persis dengan transaksi yang sudah pernah dibuat sebelumnya
-- (walau transaksi lamanya masih berstatus pending). Fitur "Bayar Sekarang"
-- butuh generate token Snap BARU untuk order yang sama — jadi kita pakai
-- order_id yang sedikit berbeda tiap kali retry (order_number asli + suffix
-- unik), dan kolom ini menyimpan order_id TERAKHIR yang dipakai ke Midtrans,
-- supaya webhook notifikasi bisa tetap menemukan order yang benar walau
-- order_id yang dikirim Midtrans bukan order_number asli.

alter table payments add column if not exists midtrans_order_id text;

create index if not exists idx_payments_midtrans_order_id on payments(midtrans_order_id);
