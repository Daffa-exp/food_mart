import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const dashboardRepository = {
  /**
   * Revenue & jumlah order dihitung dari order yang sudah settlement
   * (payments.status = 'settlement'), bukan semua order — supaya tidak
   * menghitung order yang belum/tidak jadi dibayar.
   */
  async getRevenueSummary(sinceDate: Date) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total_amount, created_at, payments!inner(status)")
      .eq("payments.status", "settlement")
      .gte("created_at", sinceDate.toISOString());

    if (error) throw new AppError(`Gagal mengambil ringkasan revenue: ${error.message}`, 500);

    const totalRevenue = (data ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
    return { totalRevenue, totalOrders: data?.length ?? 0 };
  },

  async getOrderStatusCounts() {
    const { data, error } = await supabaseAdmin.from("orders").select("status");
    if (error) throw new AppError(`Gagal mengambil status order: ${error.message}`, 500);

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
    }
    return counts;
  },

  async getBestSellingProducts(limit = 5) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, sold_count, final_price, images:product_images(image_url, is_primary)")
      .order("sold_count", { ascending: false })
      .limit(limit);

    if (error) throw new AppError(`Gagal mengambil produk terlaris: ${error.message}`, 500);
    return data ?? [];
  },

  async getRecentOrders(limit = 8) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, recipient_name, status, total_amount, created_at, payments(status)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new AppError(`Gagal mengambil order terbaru: ${error.message}`, 500);
    return data ?? [];
  },

  /**
   * Data grafik: total revenue per hari, 14 hari terakhir — dipakai untuk
   * chart tren penjualan di dashboard.
   */
  async getDailyRevenue(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total_amount, created_at, payments!inner(status)")
      .eq("payments.status", "settlement")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw new AppError(`Gagal mengambil data grafik: ${error.message}`, 500);

    const grouped: Record<string, number> = {};
    for (const row of data ?? []) {
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      grouped[day] = (grouped[day] ?? 0) + Number(row.total_amount);
    }
    return grouped;
  },
};
