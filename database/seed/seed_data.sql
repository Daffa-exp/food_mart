-- =========================================================
-- FOODMART SEED DATA
-- Data awal sesuai konten pada desain Figma
-- =========================================================

-- Categories (sesuai filter di halaman Menu)
insert into categories (name, slug, icon, display_order) values
  ('Burger', 'burger', 'Beef', 1),
  ('Pizza', 'pizza', 'Pizza', 2),
  ('Ayam', 'ayam', 'Drumstick', 3),
  ('Nasi', 'nasi', 'UtensilsCrossed', 4),
  ('Minuman', 'minuman', 'CupSoda', 5),
  ('Dessert', 'dessert', 'IceCreamCone', 6),
  ('Snack', 'snack', 'Cookie', 7),
  ('Seafood', 'seafood', 'Fish', 8);

-- Products (contoh sesuai kartu "Produk Terlaris" & Menu)
-- CATATAN: id memakai UUID FIXED (bukan uuid_generate_v4()) agar sinkron
-- dengan frontend (dulu utils/mock-data.ts di Fase 3, sekarang tinggal
-- referensi historis karena Fase 5 sudah fetch dari API sungguhan).
insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, discount_percentage, is_best_seller, is_promo, rating_avg, rating_count, sold_count,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '11111111-1111-4111-8111-111111111111', id, 'Classic Smash Burger Double Patty', 'classic-smash-burger-double-patty',
  'Double beef patty, cheddar cheese, lettuce, tomato, special sauce',
  E'Nikmati kelezatan Classic Smash Burger Double Patty yang dibuat dengan teknik smash burger untuk mendapatkan tekstur renyah di luar namun tetap juicy di dalam. Burger ini disajikan dengan roti brioche lembut, dua lapis beef patty juicy, keju cheddar leleh, selada segar, tomat, dan pilihan saus spesial rahasia FoodMart Kitchen.\n\nDisajikan dalam kondisi fresh setiap kali pesanan dibuat, untuk menjaga kualitas rasa dan kesegaran produk.',
  array['Roti Brioche','Double Beef Patty','Keju Cheddar','Selada Segar','Tomat','Bawang Bombay','Saus Spesial FoodMart','Acar Timun'],
  'Simpan pada suhu 0-5°C dan konsumsi sebelum tanggal kedaluwarsa untuk menjaga kualitas rasa dan kesegaran produk.',
  65000, 25, true, true, 4.9, 1248, 2400,
  650, 0, '1 Orang', '±350 gram', '24 Jam', '1 Hari Setelah Produksi'
from categories where slug = 'burger';

insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, is_best_seller, rating_avg, rating_count, sold_count,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '22222222-2222-4222-8222-222222222222', id, 'Pepperoni Pizza Slice', 'pepperoni-pizza-slice',
  'Crispy thin crust, mozzarella, pepperoni, oregano, tomato base',
  'Pizza dengan crust tipis renyah, saus tomat rumahan, keju mozzarella melimpah, dan taburan pepperoni pilihan. Dipanggang hingga pinggirannya kecoklatan sempurna.',
  array['Thin Crust','Saus Tomat','Mozzarella','Pepperoni','Oregano'],
  'Sajikan segera setelah diterima untuk tekstur terbaik.',
  55000, true, 4.7, 890, 1560,
  480, 1, '1 Orang', '±220 gram', '12 Jam', '12 Jam Setelah Produksi'
from categories where slug = 'pizza';

insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, is_best_seller, rating_avg, rating_count, sold_count,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '33333333-3333-4333-8333-333333333333', id, 'Ayam Crispy BBQ', 'ayam-crispy-bbq',
  'Golden fried chicken, smoky BBQ glaze, coleslaw, pickles',
  'Ayam goreng crispy dengan lapisan tepung renyah, disiram saus BBQ smoky yang kaya rasa, disajikan bersama coleslaw segar dan acar.',
  array['Ayam Fillet','Tepung Crispy','Saus BBQ','Coleslaw','Acar Timun'],
  'Konsumsi selagi hangat untuk tekstur crispy terbaik.',
  48000, true, 4.6, 754, 1980,
  590, 2, '1 Orang', '±300 gram', '12 Jam', '12 Jam Setelah Produksi'
from categories where slug = 'ayam';

insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, rating_avg, rating_count, sold_count,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '44444444-4444-4444-8444-444444444444', id, 'Kentang Goreng Garlic', 'kentang-goreng-garlic',
  'French fries dengan taburan garlic dan parmesan',
  'Kentang goreng renyah dengan taburan garlic powder dan parmesan cheese, cocok jadi teman makan berat atau camilan sore.',
  array['Kentang','Garlic Powder','Parmesan','Parsley'],
  'Sajikan segera selagi hangat.',
  28000, 4.5, 432, 980,
  320, 0, '1 Porsi', '±180 gram', '6 Jam', '6 Jam Setelah Produksi'
from categories where slug = 'snack';

insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, rating_avg, rating_count, sold_count,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '55555555-5555-4555-8555-555555555555', id, 'Soda Citrus Cold', 'soda-citrus-cold',
  'Minuman bersoda dingin dengan citrus segar',
  'Minuman bersoda dengan perpaduan citrus segar, disajikan dingin dan menyegarkan.',
  array['Air Soda','Sari Citrus','Es Batu'],
  'Simpan dingin, konsumsi segera setelah dibuka.',
  22000, 4.7, 210, 3100,
  140, 0, '1 Gelas (350ml)', '350 ml', '3 Jam', '3 Jam Setelah Produksi'
from categories where slug = 'minuman';

insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, rating_avg, rating_count, sold_count, is_new,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '66666666-6666-4666-8666-666666666666', id, 'Tiramisu Creamy', 'tiramisu-creamy',
  'Espresso-soaked ladyfingers, mascarpone cream, cocoa dusting',
  'Dessert klasik Italia dengan lapisan ladyfinger yang direndam espresso, krim mascarpone lembut, dan taburan bubuk kakao.',
  array['Ladyfinger','Espresso','Mascarpone Cream','Cocoa Powder'],
  'Simpan pada suhu 0-5°C.',
  42000, 4.9, 320, 860, true,
  380, 0, '1 Porsi', '±150 gram', '24 Jam', '24 Jam Setelah Produksi'
from categories where slug = 'dessert';

insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, discount_percentage, is_promo, rating_avg, rating_count, sold_count,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '77777777-7777-4777-8777-777777777777', id, 'Fast Combo Box', 'fast-combo-box',
  'Paket burger, kentang goreng, dan minuman',
  'Paket hemat berisi burger, kentang goreng, dan minuman segar — cocok untuk makan siang praktis.',
  array['Burger','Kentang Goreng','Minuman Soda'],
  'Sajikan segera selagi hangat.',
  75000, 10, true, 4.6, 560, 1200,
  850, 0, '1 Paket', '±550 gram', '6 Jam', '6 Jam Setelah Produksi'
from categories where slug = 'burger';

insert into products (
  id, category_id, name, slug, short_description, description, composition, storage_info,
  price, rating_avg, rating_count, sold_count,
  calories, spicy_level, portion_info, weight_info, shelf_life_info, expiry_info
)
select
  '88888888-8888-4888-8888-888888888888', id, 'Seafood Crispy Platter', 'seafood-crispy-platter',
  'Udang dan cumi crispy dengan saus sambal mangga',
  'Kombinasi udang dan cumi crispy yang digoreng garing, disajikan dengan saus sambal mangga segar.',
  array['Udang','Cumi','Tepung Crispy','Saus Sambal Mangga'],
  'Sajikan segera selagi hangat untuk tekstur terbaik.',
  68000, 4.8, 198, 540,
  520, 3, '1 Porsi', '±320 gram', '6 Jam', '6 Jam Setelah Produksi'
from categories where slug = 'seafood';

-- Gambar produk (URL terverifikasi lewat halaman Unsplash asli, sesuai nama produk)
insert into product_images (product_id, image_url, is_primary, display_order)
values
  ('11111111-1111-4111-8111-111111111111', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=900&q=80', true, 1),
  ('22222222-2222-4222-8222-222222222222', 'https://images.unsplash.com/photo-1440637475816-2e8bf1d4b6f3?w=900&q=80', true, 1),
  ('33333333-3333-4333-8333-333333333333', 'https://images.unsplash.com/photo-1657271511865-f610b280dca4?w=900&q=80', true, 1),
  ('44444444-4444-4444-8444-444444444444', 'https://images.unsplash.com/photo-1682117650826-881357860ec9?w=900&q=80', true, 1),
  ('55555555-5555-4555-8555-555555555555', 'https://images.unsplash.com/photo-1544241907-f3f1f5ded15a?w=900&q=80', true, 1),
  ('66666666-6666-4666-8666-666666666666', 'https://images.unsplash.com/photo-1746888151121-1002113ed286?w=900&q=80', true, 1),
  ('77777777-7777-4777-8777-777777777777', 'https://images.unsplash.com/photo-1756129725752-7b29412f20c7?w=900&q=80', true, 1),
  ('88888888-8888-4888-8888-888888888888', 'https://images.unsplash.com/photo-1631233208988-edcbb30e8bd8?w=900&q=80', true, 1);

-- Inventory untuk setiap produk (stok default)
insert into inventory (product_id, stock_quantity, low_stock_threshold)
select id, 100, 10 from products;

-- Settings dasar (sesuai footer & info operasional)
insert into settings (key, value) values
  ('store_info', '{"name":"FoodMart","tagline":"PREMIUM FOOD","email":"support@foodmart.id","phone":"+62 812-3456-7890","address":"Jl. Kuliner No. 12, Bandung Barat","operating_hours":"Setiap Hari 10:00 - 22:00"}'),
  ('shipping_fee', '{"instant":15000,"same_day":10000,"regular":5000,"free_shipping_min":50000}'),
  ('service_fee', '{"amount":2000}');
