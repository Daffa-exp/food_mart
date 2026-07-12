-- =========================================================
-- FOODMART ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_policies
-- =========================================================
-- Konvensi:
--   auth.uid() -> id user yang sedang login (Supabase Auth)
--   users.auth_id = auth.uid() menghubungkan tabel users ke auth.users
--   Admin diverifikasi lewat tabel admins.auth_id = auth.uid()
-- =========================================================

-- Helper function: cek apakah user yang login adalah admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admins where auth_id = auth.uid() and is_active = true
  );
$$ language sql stable security definer;

-- Helper function: ambil users.id dari auth.uid()
create or replace function current_user_id()
returns uuid as $$
  select id from users where auth_id = auth.uid();
$$ language sql stable security definer;

-- =========================================================
-- USERS
-- =========================================================
alter table users enable row level security;

create policy "users_select_own" on users
  for select using (auth_id = auth.uid() or is_admin());

create policy "users_update_own" on users
  for update using (auth_id = auth.uid());

create policy "users_admin_all" on users
  for all using (is_admin());

-- =========================================================
-- ADMINS (hanya admin yang bisa lihat/kelola)
-- =========================================================
alter table admins enable row level security;

create policy "admins_self_or_superadmin" on admins
  for select using (auth_id = auth.uid() or is_admin());

create policy "admins_manage_by_superadmin" on admins
  for all using (
    exists (select 1 from admins where auth_id = auth.uid() and role = 'super_admin')
  );

-- =========================================================
-- CATEGORIES, PRODUCTS, PRODUCT_IMAGES, BANNERS (public read)
-- =========================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table banners enable row level security;

create policy "categories_public_read" on categories
  for select using (is_active = true or is_admin());
create policy "categories_admin_write" on categories
  for all using (is_admin());

create policy "products_public_read" on products
  for select using (is_active = true or is_admin());
create policy "products_admin_write" on products
  for all using (is_admin());

create policy "product_images_public_read" on product_images
  for select using (true);
create policy "product_images_admin_write" on product_images
  for all using (is_admin());

create policy "banners_public_read" on banners
  for select using (is_active = true or is_admin());
create policy "banners_admin_write" on banners
  for all using (is_admin());

-- =========================================================
-- INVENTORY & STOCK_LOGS (admin only)
-- =========================================================
alter table inventory enable row level security;
alter table stock_logs enable row level security;

create policy "inventory_admin_only" on inventory for all using (is_admin());
create policy "stock_logs_admin_only" on stock_logs for all using (is_admin());

-- =========================================================
-- CART & CART_ITEMS (pemilik saja)
-- =========================================================
alter table cart enable row level security;
alter table cart_items enable row level security;

create policy "cart_owner_only" on cart
  for all using (user_id = current_user_id() or is_admin());

create policy "cart_items_owner_only" on cart_items
  for all using (
    cart_id in (select id from cart where user_id = current_user_id())
    or is_admin()
  );

-- =========================================================
-- WISHLIST (pemilik saja)
-- =========================================================
alter table wishlist enable row level security;

create policy "wishlist_owner_only" on wishlist
  for all using (user_id = current_user_id() or is_admin());

-- =========================================================
-- SHIPPING ADDRESSES (pemilik saja)
-- =========================================================
alter table shipping_addresses enable row level security;

create policy "shipping_addresses_owner_only" on shipping_addresses
  for all using (user_id = current_user_id() or is_admin());

-- =========================================================
-- COUPONS & PROMOTIONS (public read aktif, admin kelola)
-- =========================================================
alter table coupons enable row level security;
alter table promotions enable row level security;

create policy "coupons_public_read_active" on coupons
  for select using (is_active = true or is_admin());
create policy "coupons_admin_write" on coupons
  for all using (is_admin());

create policy "promotions_public_read_active" on promotions
  for select using (is_active = true or is_admin());
create policy "promotions_admin_write" on promotions
  for all using (is_admin());

-- =========================================================
-- ORDERS & ORDER_ITEMS (pemilik + admin)
-- =========================================================
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "orders_owner_read" on orders
  for select using (user_id = current_user_id() or is_admin());
create policy "orders_owner_insert" on orders
  for insert with check (user_id = current_user_id());
create policy "orders_admin_update" on orders
  for update using (is_admin());

create policy "order_items_owner_read" on order_items
  for select using (
    order_id in (select id from orders where user_id = current_user_id())
    or is_admin()
  );
create policy "order_items_owner_insert" on order_items
  for insert with check (
    order_id in (select id from orders where user_id = current_user_id())
  );

-- =========================================================
-- PAYMENTS & PAYMENT_LOGS (pemilik baca, sistem/admin tulis)
-- =========================================================
alter table payments enable row level security;
alter table payment_logs enable row level security;

create policy "payments_owner_read" on payments
  for select using (
    order_id in (select id from orders where user_id = current_user_id())
    or is_admin()
  );
create policy "payments_admin_write" on payments
  for all using (is_admin());

create policy "payment_logs_admin_only" on payment_logs
  for all using (is_admin());

-- =========================================================
-- REVIEWS (public read, pemilik tulis, admin kelola)
-- =========================================================
alter table reviews enable row level security;

create policy "reviews_public_read" on reviews
  for select using (is_visible = true or is_admin());
create policy "reviews_owner_write" on reviews
  for insert with check (user_id = current_user_id());
create policy "reviews_owner_update" on reviews
  for update using (user_id = current_user_id() or is_admin());

-- =========================================================
-- NOTIFICATIONS (pemilik saja)
-- =========================================================
alter table notifications enable row level security;

create policy "notifications_owner_only" on notifications
  for all using (user_id = current_user_id() or is_admin());

-- =========================================================
-- SETTINGS (public read, admin write)
-- =========================================================
alter table settings enable row level security;

create policy "settings_public_read" on settings
  for select using (true);
create policy "settings_admin_write" on settings
  for all using (is_admin());

-- =========================================================
-- ACTIVITY_LOGS (admin only)
-- =========================================================
alter table activity_logs enable row level security;

create policy "activity_logs_admin_only" on activity_logs
  for all using (is_admin());
