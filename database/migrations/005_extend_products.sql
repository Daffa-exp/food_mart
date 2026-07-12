-- =========================================================
-- FOODMART EXTEND PRODUCTS TABLE
-- Migration: 005_extend_products
-- =========================================================
-- Menambahkan kolom detail produk yang dipakai halaman Product Detail
-- (sebelumnya hanya ada di mock data Fase 3, sekarang jadi data sungguhan).

alter table products
  add column if not exists weight_info varchar(50),
  add column if not exists shelf_life_info varchar(50),
  add column if not exists production_info varchar(100) default 'Hari Pemesanan',
  add column if not exists expiry_info varchar(100),
  add column if not exists origin_info varchar(100) default 'FoodMart Kitchen';

-- Ubah composition dari text tunggal menjadi array (satu item per bahan),
-- supaya konsisten dengan tampilan bullet-list di Product Detail.
alter table products
  alter column composition type text[]
  using case
    when composition is null or composition = '' then array[]::text[]
    else string_to_array(composition, ',')
  end;
