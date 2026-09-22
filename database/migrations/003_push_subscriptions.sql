-- =========================================================
-- Web Push Notifications — tabel penyimpanan subscription
-- Jalankan sekali lewat Supabase SQL Editor
-- =========================================================
--
-- Satu baris = satu browser/device yang sudah kasih izin notifikasi.
-- Satu user bisa punya banyak baris (login di HP + laptop sekaligus,
-- semuanya dapat notifikasi).

create table if not exists push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists idx_push_subscriptions_user on push_subscriptions(user_id);
