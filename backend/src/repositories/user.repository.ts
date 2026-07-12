import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export interface GuestUserInput {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export const userRepository = {
  async findByAuthId(authId: string) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .maybeSingle();

    if (error) throw new AppError(`Gagal mengambil data user: ${error.message}`, 500);
    return data;
  },

  /**
   * Sama seperti findByAuthId, tapi self-healing: kalau baris public.users
   * belum ada (mis. akun dibuat sebelum trigger on_auth_user_created
   * terpasang, atau trigger sempat gagal), baris akan dibuat otomatis dari
   * data auth.users supaya user tidak macet di semua halaman yang butuh
   * data profil (riwayat pesanan, notifikasi, wishlist, alamat, dll).
   */
  async findOrCreateByAuthId(authId: string) {
    const existing = await this.findByAuthId(authId);
    if (existing) return existing;

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(authId);
    if (authError || !authUser?.user?.email) {
      throw new AppError("Data user tidak ditemukan", 404);
    }

    const email = authUser.user.email;
    const fullName =
      (authUser.user.user_metadata?.full_name as string | undefined) ?? email.split("@")[0];

    // Pakai upsert on-conflict(email) — sama seperti trigger handle_new_auth_user,
    // supaya kalau ternyata baris guest dengan email sama sudah ada, baris itu
    // yang "diklaim" alih-alih membuat duplikat.
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          auth_id: authId,
          full_name: fullName,
          email,
          is_email_verified: authUser.user.email_confirmed_at != null,
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) throw new AppError(`Gagal membuat data user: ${error.message}`, 500);
    return data;
  },

  async findByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) throw new AppError(`Gagal mengambil data user: ${error.message}`, 500);
    return data;
  },

  /**
   * Dipakai untuk guest checkout: cari user berdasarkan email,
   * kalau belum ada buat baru (tanpa auth_id — belum punya akun terdaftar).
   */
  async findOrCreateGuest(input: GuestUserInput) {
    const existing = await this.findByEmail(input.email);
    if (existing) return existing;

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        full_name: input.fullName,
        email: input.email,
        phone_number: input.phoneNumber,
        is_email_verified: false,
      })
      .select()
      .single();

    if (error) throw new AppError(`Gagal membuat data pemesan: ${error.message}`, 500);
    return data;
  },

  async updateProfile(
    authId: string,
    update: { fullName?: string; phoneNumber?: string; avatarUrl?: string }
  ) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        full_name: update.fullName,
        phone_number: update.phoneNumber,
        avatar_url: update.avatarUrl,
      })
      .eq("auth_id", authId)
      .select()
      .single();

    if (error) throw new AppError(`Gagal memperbarui profil: ${error.message}`, 500);
    return data;
  },
};
