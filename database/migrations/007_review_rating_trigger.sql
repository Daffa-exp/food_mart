-- =========================================================
-- FOODMART REVIEW RATING TRIGGER
-- Migration: 007_review_rating_trigger
-- =========================================================
-- Fitur baru: user bisa memberi rating & komentar untuk pesanan yang sudah
-- selesai (delivered). Migration ini menambahkan:
--   1. Constraint supaya 1 order_item cuma bisa direview sekali.
--   2. Trigger yang otomatis menghitung ulang products.rating_avg &
--      products.rating_count setiap kali ada review baru/diubah/dihapus,
--      supaya rating yang tampil di menu & detail produk selalu sinkron.

alter table reviews
  add constraint uq_reviews_order_item unique (order_item_id);

create or replace function refresh_product_rating()
returns trigger as $$
declare
  target_product_id uuid := coalesce(new.product_id, old.product_id);
begin
  update products
  set rating_avg = coalesce(
        (select round(avg(rating)::numeric, 2) from reviews
         where product_id = target_product_id and is_visible = true),
        0
      ),
      rating_count = (
        select count(*) from reviews
        where product_id = target_product_id and is_visible = true
      )
  where id = target_product_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists trg_refresh_product_rating on reviews;
create trigger trg_refresh_product_rating
  after insert or update or delete on reviews
  for each row execute function refresh_product_rating();
