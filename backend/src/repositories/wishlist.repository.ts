import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";
import { PRODUCT_SELECT_FOR_WISHLIST } from "./product.repository";

export const wishlistRepository = {
  async listByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("wishlist")
      .select(`id, created_at, product:products(${PRODUCT_SELECT_FOR_WISHLIST})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new AppError(`Gagal mengambil wishlist: ${error.message}`, 500);
    return data ?? [];
  },

  async isWishlisted(userId: string, productId: string) {
    const { data } = await supabaseAdmin
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();
    return !!data;
  },

  async add(userId: string, productId: string) {
    const { error } = await supabaseAdmin
      .from("wishlist")
      .insert({ user_id: userId, product_id: productId });
    if (error && error.code !== "23505") {
      // 23505 = unique_violation, artinya sudah ada di wishlist — aman diabaikan (idempotent)
      throw new AppError(`Gagal menambah wishlist: ${error.message}`, 500);
    }
  },

  async remove(userId: string, productId: string) {
    const { error } = await supabaseAdmin
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (error) throw new AppError(`Gagal menghapus wishlist: ${error.message}`, 500);
  },
};
