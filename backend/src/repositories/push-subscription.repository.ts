import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export const pushSubscriptionRepository = {
  async save(userId: string, sub: PushSubscriptionInput, userAgent?: string) {
    // upsert berdasarkan endpoint (unique) — kalau browser yang sama
    // subscribe ulang (mis. setelah clear cache), baris lama di-update,
    // bukan bikin duplikat.
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_agent: userAgent ?? null,
      },
      { onConflict: "endpoint" }
    );
    if (error) throw new AppError(`Gagal menyimpan subscription notifikasi: ${error.message}`, 500);
  },

  async remove(endpoint: string) {
    await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  },

  async listByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);
    if (error) throw new AppError(`Gagal mengambil subscription notifikasi: ${error.message}`, 500);
    return data ?? [];
  },

  // Dipakai untuk broadcast (promo baru) ke semua customer aktif sekaligus.
  async listAll() {
    const { data, error } = await supabaseAdmin.from("push_subscriptions").select("endpoint, p256dh, auth");
    if (error) throw new AppError(`Gagal mengambil semua subscription notifikasi: ${error.message}`, 500);
    return data ?? [];
  },
};
