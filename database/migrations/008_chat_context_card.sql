-- =========================================================
-- CHAT: kartu konteks otomatis (foto produk / info resi pesanan)
-- =========================================================

-- Simpan ID produk/pesanan asli (bukan cuma nama/nomor resi sebagai teks),
-- supaya backend bisa ambil foto, harga, status, dst untuk kartu otomatis.
alter table chat_conversations add column if not exists reference_id uuid;

-- Pesan sistem/kartu (foto produk, ringkasan resi) disimpan sebagai data
-- terstruktur di sini, terpisah dari teks biasa di kolom "message".
alter table chat_messages add column if not exists metadata jsonb;
