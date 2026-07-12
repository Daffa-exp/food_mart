-- =========================================================
-- FOODMART FIX PRODUCT IMAGES
-- Migration: 006_fix_product_images
-- =========================================================
-- Jalankan ini di SQL Editor Supabase kalau Anda SUDAH pernah menjalankan
-- seed_data.sql sebelumnya (jadi tidak perlu hapus/insert ulang data).
-- Semua URL di bawah sudah diverifikasi satu-satu lewat halaman Unsplash
-- aslinya (dicek judul & deskripsi foto), bukan ditebak dari memori lagi.

-- Hapus gambar lama yang salah/tidak sesuai
delete from product_images where product_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666',
  '77777777-7777-4777-8777-777777777777',
  '88888888-8888-4888-8888-888888888888'
);

-- Masukkan gambar yang benar-benar sesuai nama produknya
insert into product_images (product_id, image_url, is_primary, display_order) values
  -- Classic Smash Burger Double Patty
  ('11111111-1111-4111-8111-111111111111', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=900&q=80', true, 1),
  -- Pepperoni Pizza Slice
  ('22222222-2222-4222-8222-222222222222', 'https://images.unsplash.com/photo-1440637475816-2e8bf1d4b6f3?w=900&q=80', true, 1),
  -- Ayam Crispy BBQ
  ('33333333-3333-4333-8333-333333333333', 'https://images.unsplash.com/photo-1657271511865-f610b280dca4?w=900&q=80', true, 1),
  -- Kentang Goreng Garlic
  ('44444444-4444-4444-8444-444444444444', 'https://images.unsplash.com/photo-1682117650826-881357860ec9?w=900&q=80', true, 1),
  -- Soda Citrus Cold
  ('55555555-5555-4555-8555-555555555555', 'https://images.unsplash.com/photo-1544241907-f3f1f5ded15a?w=900&q=80', true, 1),
  -- Tiramisu Creamy
  ('66666666-6666-4666-8666-666666666666', 'https://images.unsplash.com/photo-1746888151121-1002113ed286?w=900&q=80', true, 1),
  -- Fast Combo Box (burger + fries + drink)
  ('77777777-7777-4777-8777-777777777777', 'https://images.unsplash.com/photo-1756129725752-7b29412f20c7?w=900&q=80', true, 1),
  -- Seafood Crispy Platter
  ('88888888-8888-4888-8888-888888888888', 'https://images.unsplash.com/photo-1631233208988-edcbb30e8bd8?w=900&q=80', true, 1);
