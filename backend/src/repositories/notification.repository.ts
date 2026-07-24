import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";
import { pushService } from "../services/push.service";

export type NotificationType = "order" | "promotion" | "system" | "payment" | "review";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
}

export const notificationRepository = {
  async create(input: CreateNotificationInput) {
    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      reference_id: input.referenceId ?? null,
    });
    // Notifikasi gagal terkirim tidak boleh menggagalkan aksi utama admin
    // (mis. balas ulasan tetap tersimpan walau notifikasi gagal dibuat),
    // jadi di sini cukup dilempar sebagai warning ke caller lewat log.
    if (error) {
      console.error("Gagal membuat notifikasi:", error.message);
      return;
    }

    // Push notification dikirim SETELAH notifikasi in-app berhasil
    // tersimpan, dan TIDAK di-await (fire-and-forget) — supaya caller
    // (mis. webhook pembayaran) tidak ikut lambat/gagal gara-gara proses
    // kirim push yang bisa makan waktu beberapa detik per device.
    pushService
      .sendToUser(input.userId, {
        title: input.title,
        body: input.message,
        url: pushUrlForType(input.type, input.referenceId),
      })
      .catch((err: unknown) => console.error("[push] Gagal kirim notifikasi push:", err));
  },

  async listByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new AppError(`Gagal mengambil notifikasi: ${error.message}`, 500);
    return data ?? [];
  },

  async markAsRead(userId: string, notificationId: string) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);
    if (error) throw new AppError(`Gagal memperbarui notifikasi: ${error.message}`, 500);
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw new AppError(`Gagal memperbarui notifikasi: ${error.message}`, 500);
  },

  // Kirim satu notifikasi yang sama ke SEMUA customer aktif — dipakai saat
  // admin membuat promo/kupon baru. Dilakukan lewat insert massal (bukan loop
  // satu-satu) supaya tetap ringan walau jumlah customer banyak.
  async broadcastToAllCustomers(input: Omit<CreateNotificationInput, "userId">) {
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("is_active", true);

    if (usersError) {
      console.error("Gagal mengambil daftar customer untuk broadcast notifikasi:", usersError.message);
      return;
    }
    if (!users || users.length === 0) return;

    const rows = users.map((u) => ({
      user_id: u.id,
      type: input.type,
      title: input.title,
      message: input.message,
      reference_id: input.referenceId ?? null,
    }));

    // Notifikasi gagal terkirim tidak boleh menggagalkan aksi utama admin
    // (promo/kupon tetap tersimpan walau broadcast notifikasi gagal).
    const { error } = await supabaseAdmin.from("notifications").insert(rows);
    if (error) {
      console.error("Gagal broadcast notifikasi:", error.message);
      return;
    }

    pushService
      .sendToAll({
        title: input.title,
        body: input.message,
        url: pushUrlForType(input.type, input.referenceId),
      })
      .catch((err: unknown) => console.error("[push] Gagal broadcast notifikasi push:", err));
  },
};

// URL halaman yang dibuka kalau notifikasi push diklik — disesuaikan
// dengan jenis notifikasinya, supaya user langsung diarahkan ke tempat
// yang relevan (bukan cuma buka halaman utama).
function pushUrlForType(type: NotificationType, referenceId?: string): string {
  switch (type) {
    case "order":
    case "payment":
      return referenceId ? `/checkout/berhasil?order_id=${referenceId}` : "/orders";
    case "review":
      return "/orders";
    case "promotion":
      return "/menu";
    default:
      return "/notifikasi";
  }
}