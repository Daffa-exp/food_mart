-- =========================================================
-- FOODMART DATABASE SCHEMA
-- Supabase PostgreSQL
-- Migration: 001_initial_schema
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================
-- ENUM TYPES
-- =========================================================

create type user_role as enum ('customer', 'admin', 'super_admin');
create type order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type payment_status as enum ('pending', 'settlement', 'expire', 'cancel', 'failure', 'challenge', 'refund');
create type payment_method as enum ('qris', 'gopay', 'shopeepay', 'dana', 'ovo', 'bank_transfer', 'credit_card', 'bca_va', 'bni_va', 'bri_va', 'mandiri_va');
create type delivery_method as enum ('instant', 'same_day', 'regular');
create type coupon_type as enum ('percentage', 'fixed_amount', 'free_shipping');
create type notification_type as enum ('order', 'promotion', 'system', 'payment', 'review');
create type stock_movement_type as enum ('in', 'out', 'adjustment', 'return');

-- =========================================================
-- USERS & ADMINS
-- =========================================================

create table users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique, -- references Supabase auth.users.id
  full_name varchar(150) not null,
  email varchar(150) unique not null,
  phone_number varchar(20),
  avatar_url text,
  is_email_verified boolean default false,
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_users_email on users(email);
create index idx_users_auth_id on users(auth_id);

create table admins (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique,
  full_name varchar(150) not null,
  email varchar(150) unique not null,
  avatar_url text,
  role user_role not null default 'admin',
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_admins_email on admins(email);

-- =========================================================
-- CATEGORIES & PRODUCTS
-- =========================================================

create table categories (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  slug varchar(120) unique not null,
  icon varchar(100), -- lucide-react icon name
  description text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_categories_slug on categories(slug);

create table products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references categories(id) on delete restrict,
  name varchar(150) not null,
  slug varchar(180) unique not null,
  short_description varchar(255),
  description text,
  composition text,
  storage_info text,
  price numeric(12,2) not null check (price >= 0),
  discount_percentage numeric(5,2) default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  final_price numeric(12,2) generated always as (price - (price * discount_percentage / 100)) stored,
  calories int,
  spicy_level smallint check (spicy_level between 0 and 5),
  portion_info varchar(100),
  is_best_seller boolean default false,
  is_promo boolean default false,
  is_new boolean default false,
  is_active boolean default true,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  sold_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_products_category on products(category_id);
create index idx_products_slug on products(slug);
create index idx_products_best_seller on products(is_best_seller) where is_best_seller = true;
create index idx_products_active on products(is_active) where is_active = true;

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  display_order int default 0,
  created_at timestamptz default now()
);
create index idx_product_images_product on product_images(product_id);

-- =========================================================
-- INVENTORY
-- =========================================================

create table inventory (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null unique references products(id) on delete cascade,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  low_stock_threshold int default 10,
  updated_at timestamptz default now()
);

create table stock_logs (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  admin_id uuid references admins(id),
  movement_type stock_movement_type not null,
  quantity int not null,
  note text,
  created_at timestamptz default now()
);
create index idx_stock_logs_product on stock_logs(product_id);

-- =========================================================
-- CART
-- =========================================================

create table cart (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references cart(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (cart_id, product_id)
);
create index idx_cart_items_cart on cart_items(cart_id);

-- =========================================================
-- WISHLIST
-- =========================================================

create table wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);
create index idx_wishlist_user on wishlist(user_id);

-- =========================================================
-- SHIPPING ADDRESSES
-- =========================================================

create table shipping_addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  recipient_name varchar(150) not null,
  phone_number varchar(20) not null,
  full_address text not null,
  address_note text,
  city varchar(100) not null,
  postal_code varchar(10) not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_shipping_addresses_user on shipping_addresses(user_id);

-- =========================================================
-- COUPONS & PROMOTIONS
-- =========================================================

create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code varchar(50) unique not null,
  description text,
  type coupon_type not null,
  value numeric(12,2) not null,
  min_purchase numeric(12,2) default 0,
  max_discount numeric(12,2),
  usage_limit int,
  used_count int default 0,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_coupons_code on coupons(code);

create table promotions (
  id uuid primary key default uuid_generate_v4(),
  title varchar(200) not null,
  description text,
  banner_image_url text,
  product_id uuid references products(id) on delete set null,
  discount_percentage numeric(5,2),
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- ORDERS
-- =========================================================

create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number varchar(30) unique not null,
  user_id uuid not null references users(id) on delete restrict,
  shipping_address_id uuid references shipping_addresses(id),
  status order_status not null default 'pending',
  delivery_method delivery_method not null default 'regular',
  recipient_name varchar(150) not null,
  recipient_phone varchar(20) not null,
  full_address text not null,
  address_note text,
  city varchar(100) not null,
  postal_code varchar(10) not null,
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  coupon_id uuid references coupons(id),
  order_note text,
  estimated_delivery_minutes int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_number on orders(order_number);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  product_name varchar(150) not null, -- snapshot at time of order
  product_image_url text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(12,2) not null,
  created_at timestamptz default now()
);
create index idx_order_items_order on order_items(order_id);

-- =========================================================
-- PAYMENTS (Midtrans)
-- =========================================================

create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null unique references orders(id) on delete cascade,
  midtrans_transaction_id varchar(100),
  snap_token text,
  payment_method payment_method,
  status payment_status not null default 'pending',
  gross_amount numeric(12,2) not null,
  paid_at timestamptz,
  expired_at timestamptz,
  raw_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_payments_order on payments(order_id);
create index idx_payments_midtrans_id on payments(midtrans_transaction_id);

create table payment_logs (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references payments(id) on delete cascade,
  status payment_status not null,
  notification_payload jsonb,
  created_at timestamptz default now()
);
create index idx_payment_logs_payment on payment_logs(payment_id);

-- =========================================================
-- REVIEWS
-- =========================================================

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  admin_reply text,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_reviews_product on reviews(product_id);
create index idx_reviews_user on reviews(user_id);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type notification_type not null,
  title varchar(200) not null,
  message text not null,
  is_read boolean default false,
  reference_id uuid, -- e.g. order_id
  created_at timestamptz default now()
);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_unread on notifications(user_id, is_read) where is_read = false;

-- =========================================================
-- BANNERS & SETTINGS
-- =========================================================

create table banners (
  id uuid primary key default uuid_generate_v4(),
  title varchar(200),
  image_url text not null,
  link_url text,
  display_order int default 0,
  is_active boolean default true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table settings (
  id uuid primary key default uuid_generate_v4(),
  key varchar(100) unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- =========================================================
-- ACTIVITY LOGS
-- =========================================================

create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_type varchar(20) not null, -- 'user' | 'admin'
  actor_id uuid not null,
  action varchar(150) not null,
  entity_type varchar(50),
  entity_id uuid,
  metadata jsonb,
  ip_address varchar(50),
  created_at timestamptz default now()
);
create index idx_activity_logs_actor on activity_logs(actor_type, actor_id);

-- =========================================================
-- TRIGGERS: updated_at auto-update
-- =========================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array[
    'users','admins','categories','products','cart','cart_items',
    'shipping_addresses','coupons','promotions','orders','payments',
    'reviews','banners'
  ]
  loop
    execute format(
      'create trigger trg_set_updated_at before update on %I
       for each row execute function set_updated_at();', t
    );
  end loop;
end $$;
