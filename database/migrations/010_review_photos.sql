-- =========================================================
-- FOODMART DATABASE SCHEMA
-- Migration: 010_review_photos
-- Menambahkan dukungan foto pada ulasan produk (maks 5 foto per ulasan,
-- divalidasi di level aplikasi/backend).
-- =========================================================

alter table reviews add column if not exists photos text[] default '{}';
