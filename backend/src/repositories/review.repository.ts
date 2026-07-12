import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const reviewRepository = {
  /**
   * Ambil satu order_item milik user tertentu, dipakai untuk memastikan:
   *  - order_item itu benar-benar miliknya (lewat join ke orders.user_id)
   *  - order-nya sudah "delivered" (baru boleh direview)
   */
  async findOrderItemForReview(userId: string, orderItemId: string) {
    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select("id, product_id, order:orders!inner(id, user_id, status)")
      .eq("id", orderItemId)
      .maybeSingle();

    if (error) throw new AppError(`Gagal memeriksa item pesanan: ${error.message}`, 500);
    if (!data) return null;

    const order = Array.isArray(data.order) ? data.order[0] : data.order;
    if (!order || order.user_id !== userId) return null;

    return { productId: data.product_id as string, orderStatus: order.status as string };
  },

  async create(userId: string, payload: { productId: string; orderItemId: string; rating: number; comment?: string }) {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        user_id: userId,
        product_id: payload.productId,
        order_item_id: payload.orderItemId,
        rating: payload.rating,
        comment: payload.comment,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new AppError("Item pesanan ini sudah pernah diberi rating", 409);
      }
      throw new AppError(`Gagal menyimpan ulasan: ${error.message}`, 500);
    }
    return data;
  },

  async listMine(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id, product_id, order_item_id, rating, comment, admin_reply, created_at")
      .eq("user_id", userId);
    if (error) throw new AppError(`Gagal mengambil ulasan: ${error.message}`, 500);
    return data ?? [];
  },

  async listByProduct(productId: string) {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id, rating, comment, admin_reply, created_at, users(full_name)")
      .eq("product_id", productId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(`Gagal mengambil ulasan produk: ${error.message}`, 500);
    return data ?? [];
  },
};
