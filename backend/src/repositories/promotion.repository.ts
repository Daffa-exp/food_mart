import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const promotionRepository = {
  // Dipakai homepage publik: hanya promosi aktif & masih dalam rentang tanggal.
  async listActive() {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("promotions")
      .select("id, title, description, banner_image_url, discount_percentage, start_date, end_date, products(slug, name)")
      .eq("is_active", true)
      .lte("start_date", nowIso)
      .gte("end_date", nowIso)
      .order("start_date", { ascending: false });

    if (error) throw new AppError(`Gagal mengambil promosi: ${error.message}`, 500);
    return data ?? [];
  },
};
