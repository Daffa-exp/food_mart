-- =========================================================
-- FOODMART DATABASE FUNCTIONS
-- Migration: 003_functions
-- =========================================================

-- Mengurangi stok produk secara atomik (menghindari race condition saat
-- banyak order masuk bersamaan) + mencatat ke stock_logs.
create or replace function decrement_product_stock(
  p_product_id uuid,
  p_quantity int
)
returns void as $$
begin
  update inventory
  set stock_quantity = stock_quantity - p_quantity,
      updated_at = now()
  where product_id = p_product_id
    and stock_quantity >= p_quantity;

  if not found then
    raise exception 'Stok produk % tidak mencukupi', p_product_id;
  end if;

  insert into stock_logs (product_id, movement_type, quantity, note)
  values (p_product_id, 'out', p_quantity, 'Pengurangan otomatis dari order baru');
end;
$$ language plpgsql security definer;

-- Mengembalikan stok saat order dibatalkan / pembayaran gagal.
create or replace function restore_product_stock(
  p_product_id uuid,
  p_quantity int
)
returns void as $$
begin
  update inventory
  set stock_quantity = stock_quantity + p_quantity,
      updated_at = now()
  where product_id = p_product_id;

  insert into stock_logs (product_id, movement_type, quantity, note)
  values (p_product_id, 'return', p_quantity, 'Pengembalian stok dari order dibatalkan/gagal');
end;
$$ language plpgsql security definer;
