-- =========================================================
-- FOODMART DATABASE SCHEMA
-- Migration: 009_banner_video
-- Menambahkan dukungan banner berupa video (YouTube/Vimeo) di homepage,
-- selain gambar statis yang sudah ada.
-- =========================================================

alter table banners add column if not exists video_url text;

-- Gambar tetap dipakai sebagai thumbnail/poster, tapi tidak wajib lagi kalau
-- banner-nya berupa video (mis. video-only ad tanpa gambar cover custom).
alter table banners alter column image_url drop not null;
