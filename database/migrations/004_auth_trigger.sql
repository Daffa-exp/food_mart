-- =========================================================
-- FOODMART AUTH TRIGGER
-- Migration: 004_auth_trigger
-- =========================================================
-- Supabase Auth menyimpan user di skema `auth.users` (terpisah dari tabel
-- `public.users` kita). Trigger ini otomatis membuat baris `public.users`
-- setiap kali ada signup baru, sehingga auth_id selalu tersinkron.
-- Referensi pola resmi Supabase: https://supabase.com/docs/guides/auth/managing-user-data

create or replace function handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (auth_id, full_name, email, is_email_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.email_confirmed_at is not null
  )
  on conflict (email) do update
    set auth_id = excluded.auth_id,
        is_email_verified = excluded.is_email_verified;
  -- ON CONFLICT email: menangani kasus user pernah checkout sebagai guest
  -- (baris users dibuat tanpa auth_id) lalu mendaftar akun sungguhan dengan
  -- email yang sama — baris guest tersebut "diklaim" jadi akun terverifikasi.
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- Sinkronkan status verifikasi email saat user konfirmasi email-nya.
create or replace function handle_auth_user_email_confirmed()
returns trigger as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.users set is_email_verified = true where auth_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row execute function handle_auth_user_email_confirmed();
