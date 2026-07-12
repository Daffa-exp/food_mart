import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const bannerRepository = {
  // Dipakai oleh homepage publik: hanya banner aktif & masih dalam rentang tanggal tayang.
  async listActive() {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("banners")
      .select("id, title, image_url, video_url, link_url, display_order, start_date, end_date")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${nowIso}`)
      .or(`end_date.is.null,end_date.gte.${nowIso}`)
      .order("display_order", { ascending: true });

    if (error) throw new AppError(`Gagal mengambil banner: ${error.message}`, 500);
    return data ?? [];
  },
};
