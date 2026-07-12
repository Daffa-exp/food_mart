import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export interface ProductListFilters {
  categorySlug?: string;
  search?: string;
  sort?: "terlaris" | "terbaru" | "harga_terendah" | "harga_tertinggi" | "rating";
  isBestSeller?: boolean;
  isPromo?: boolean;
  isNew?: boolean;
  page?: number;
  pageSize?: number;
}

export const PRODUCT_SELECT_FOR_WISHLIST = `
  id, slug, name, short_description, price, discount_percentage, final_price,
  rating_avg, rating_count, sold_count, is_best_seller, is_promo, is_new,
  category:categories!inner(id, name, slug),
  images:product_images(id, image_url, is_primary, display_order),
  inventory(stock_quantity)
`;

const PRODUCT_SELECT = `
  id, slug, name, short_description, description, composition, storage_info,
  price, discount_percentage, final_price, calories, spicy_level, portion_info,
  weight_info, shelf_life_info, production_info, expiry_info, origin_info,
  is_best_seller, is_promo, is_new, rating_avg, rating_count, sold_count,
  created_at,
  category:categories!inner(id, name, slug),
  images:product_images(id, image_url, is_primary, display_order),
  inventory(stock_quantity)
`;

export const productRepository = {
  async list(filters: ProductListFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("is_active", true);

    if (filters.categorySlug && filters.categorySlug !== "semua") {
      query = query.eq("category.slug", filters.categorySlug);
    }
    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }
    if (filters.isBestSeller) query = query.eq("is_best_seller", true);
    if (filters.isPromo) query = query.eq("is_promo", true);
    if (filters.isNew) query = query.eq("is_new", true);

    switch (filters.sort) {
      case "harga_terendah":
        query = query.order("final_price", { ascending: true });
        break;
      case "harga_tertinggi":
        query = query.order("final_price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating_avg", { ascending: false });
        break;
      case "terbaru":
        query = query.order("created_at", { ascending: false });
        break;
      case "terlaris":
      default:
        query = query.order("sold_count", { ascending: false });
        break;
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new AppError(`Gagal mengambil daftar produk: ${error.message}`, 500);

    return { data: data ?? [], total: count ?? 0, page, pageSize };
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new AppError(`Gagal mengambil produk: ${error.message}`, 500);
    return data;
  },

  async getByIdForAdmin(id: string) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`${PRODUCT_SELECT}, category_id, is_active`)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new AppError(`Gagal mengambil produk: ${error.message}`, 500);
    return data;
  },

  async getRelated(categorySlug: string, excludeProductId: string, limit = 4) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("category.slug", categorySlug)
      .neq("id", excludeProductId)
      .eq("is_active", true)
      .limit(limit);

    if (error) throw new AppError(`Gagal mengambil produk terkait: ${error.message}`, 500);
    return data ?? [];
  },

  /**
   * Mengambil produk beserta stok berdasarkan daftar ID.
   * PENTING: harga final SELALU dihitung dari data ini (bukan dari payload
   * client) untuk mencegah manipulasi harga saat checkout.
   */
  async getByIds(productIds: string[]) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, discount_percentage, final_price, is_active, inventory(stock_quantity)")
      .in("id", productIds);

    if (error) throw new AppError(`Gagal mengambil data produk: ${error.message}`, 500);
    if (!data || data.length !== productIds.length) {
      throw new AppError("Beberapa produk di keranjang tidak ditemukan atau sudah tidak tersedia", 400);
    }
    return data;
  },

  async decrementStock(productId: string, quantity: number) {
    const { error } = await supabaseAdmin.rpc("decrement_product_stock", {
      p_product_id: productId,
      p_quantity: quantity,
    });
    if (error) throw new AppError(`Gagal memperbarui stok: ${error.message}`, 500);
  },

  async restoreStock(productId: string, quantity: number) {
    const { error } = await supabaseAdmin.rpc("restore_product_stock", {
      p_product_id: productId,
      p_quantity: quantity,
    });
    if (error) throw new AppError(`Gagal mengembalikan stok: ${error.message}`, 500);
  },

  // =========================================================
  // ADMIN — termasuk produk tidak aktif, tanpa filter is_active
  // =========================================================

  async listAllForAdmin(params: { search?: string; categorySlug?: string; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" });

    if (params.search) query = query.ilike("name", `%${params.search}%`);
    if (params.categorySlug) query = query.eq("category.slug", params.categorySlug);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) throw new AppError(`Gagal mengambil daftar produk: ${error.message}`, 500);
    return { data: data ?? [], total: count ?? 0, page, pageSize };
  },

  async create(payload: Record<string, unknown>) {
    const { images, ...productFields } = payload as { images?: string[] } & Record<string, unknown>;

    const { data, error } = await supabaseAdmin.from("products").insert(productFields).select().single();
    if (error) throw new AppError(`Gagal membuat produk: ${error.message}`, 500);

    if (images && images.length > 0) {
      await supabaseAdmin.from("product_images").insert(
        images.map((url, i) => ({ product_id: data.id, image_url: url, is_primary: i === 0, display_order: i }))
      );
    }
    await supabaseAdmin.from("inventory").insert({ product_id: data.id, stock_quantity: 0 });

    return data;
  },

  async update(id: string, payload: Record<string, unknown>) {
    const { images, ...productFields } = payload as { images?: string[] } & Record<string, unknown>;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(productFields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new AppError(`Gagal memperbarui produk: ${error.message}`, 500);

    if (images) {
      await supabaseAdmin.from("product_images").delete().eq("product_id", id);
      if (images.length > 0) {
        await supabaseAdmin.from("product_images").insert(
          images.map((url, i) => ({ product_id: id, image_url: url, is_primary: i === 0, display_order: i }))
        );
      }
    }
    return data;
  },

  async setActive(id: string, isActive: boolean) {
    const { error } = await supabaseAdmin.from("products").update({ is_active: isActive }).eq("id", id);
    if (error) throw new AppError(`Gagal mengubah status produk: ${error.message}`, 500);
  },

  async remove(id: string) {
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) {
      if (error.code === "23503") {
        throw new AppError(
          "Produk ini sudah pernah dipesan dan tidak bisa dihapus permanen. Nonaktifkan saja produknya.",
          409
        );
      }
      throw new AppError(`Gagal menghapus produk: ${error.message}`, 500);
    }
  },

  async updateStock(productId: string, newQuantity: number, adminId: string, note?: string) {
    const { data: current } = await supabaseAdmin
      .from("inventory")
      .select("stock_quantity")
      .eq("product_id", productId)
      .maybeSingle();

    const previousQty = current?.stock_quantity ?? 0;
    const diff = newQuantity - previousQty;

    const { error } = await supabaseAdmin
      .from("inventory")
      .update({ stock_quantity: newQuantity })
      .eq("product_id", productId);
    if (error) throw new AppError(`Gagal memperbarui stok: ${error.message}`, 500);

    await supabaseAdmin.from("stock_logs").insert({
      product_id: productId,
      admin_id: adminId,
      movement_type: diff >= 0 ? "in" : "adjustment",
      quantity: Math.abs(diff),
      note: note ?? `Penyesuaian manual stok dari ${previousQty} ke ${newQuantity}`,
    });
  },
};
