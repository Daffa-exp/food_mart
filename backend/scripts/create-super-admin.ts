/**
 * BOOTSTRAP SUPER ADMIN — cara cepat bikin akun admin pertama.
 *
 * Sebelumnya proses ini butuh 3 langkah manual (daftar sebagai customer
 * lewat UI -> buka Supabase SQL Editor -> jalankan INSERT ke tabel admins).
 * Script ini menggantikannya jadi 1 perintah: langsung bikin akun Supabase
 * Auth (via service role, otomatis ter-verifikasi, tidak perlu cek email)
 * lalu mendaftarkannya sebagai super_admin.
 *
 * Cara pakai (dari folder backend/):
 *   npm run create-admin -- admin@foodmart.id PasswordAman123 "Nama Admin"
 *
 * Kalau email-nya sudah pernah dipakai (baik sebagai customer atau admin),
 * script ini tidak membuat akun baru — cukup mempromosikan akun yang sudah
 * ada jadi super_admin, jadi aman dijalankan berkali-kali.
 */
import { supabaseAdmin } from "../src/config/supabase";

async function main() {
  const [, , email, password, ...nameParts] = process.argv;
  const fullName = nameParts.join(" ") || "Administrator";

  if (!email || !password) {
    console.error(
      "Pemakaian: npm run create-admin -- <email> <password> [\"Nama Lengkap\"]\n" +
        'Contoh  : npm run create-admin -- admin@foodmart.id PasswordAman123 "Nama Admin"'
    );
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password minimal 6 karakter (syarat Supabase Auth).");
    process.exit(1);
  }

  console.log(`\n→ Menyiapkan akun admin untuk ${email} ...`);

  // 1) Coba buat akun Supabase Auth baru. Kalau emailnya sudah terdaftar,
  //    supabaseAdmin.auth.admin.createUser akan error — kita tangkap lalu
  //    ambil akun yang sudah ada dari tabel public.users (sudah otomatis
  //    tersinkron via trigger on_auth_user_created).
  let authId: string;

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // langsung terverifikasi, tidak perlu klik link email
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    const alreadyExists = /already.*registered|already.*exists/i.test(createError.message);
    if (!alreadyExists) {
      console.error("✗ Gagal membuat akun:", createError.message);
      process.exit(1);
    }

    console.log("  Email sudah terdaftar sebelumnya, akan dipromosikan jadi super_admin...");
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from("users")
      .select("auth_id")
      .eq("email", email)
      .maybeSingle();

    if (findError || !existingUser?.auth_id) {
      console.error(
        "✗ Email sudah terdaftar di Supabase Auth tapi tidak ditemukan di tabel `users`.",
        "Coba cek manual di Supabase Dashboard > Authentication."
      );
      process.exit(1);
    }
    authId = existingUser.auth_id;
  } else {
    authId = created.user.id;
    console.log("  Akun Supabase Auth berhasil dibuat & otomatis terverifikasi.");
  }

  // 2) Daftarkan (atau perbarui) sebagai super_admin di tabel `admins`.
  const { error: adminError } = await supabaseAdmin
    .from("admins")
    .upsert(
      { auth_id: authId, full_name: fullName, email, role: "super_admin", is_active: true },
      { onConflict: "auth_id" }
    );

  if (adminError) {
    console.error("✗ Gagal mendaftarkan sebagai admin:", adminError.message);
    process.exit(1);
  }

  console.log(`\n✓ Selesai! Login di /admin/login dengan:`);
  console.log(`  Email    : ${email}`);
  console.log(`  Password : ${password}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Terjadi kesalahan tak terduga:", err);
  process.exit(1);
});
