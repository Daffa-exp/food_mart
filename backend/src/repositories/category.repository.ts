import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const categoryRepository = {
  async list() {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id, name, slug, icon, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw new AppError(`Gagal mengambil kategori: ${error.message}`, 500);
    return data ?? [];
  },

  async listAllForAdmin() {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id, name, slug, icon, display_order, is_active, description")
      .order("display_order", { ascending: true });

    if (error) throw new AppError(`Gagal mengambil kategori: ${error.message}`, 500);
    return data ?? [];
  },

  async create(payload: { name: string; slug: string; icon: string; description?: string; displayOrder?: number }) {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name: payload.name,
        slug: payload.slug,
        icon: payload.icon,
        description: payload.description,
        display_order: payload.displayOrder ?? 0,
      })
      .select()
      .single();

    if (error) throw new AppError(`Gagal membuat kategori: ${error.message}`, 500);
    return data;
  },

  async update(id: string, payload: Partial<{ name: string; slug: string; icon: string; description: string; displayOrder: number; isActive: boolean }>) {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({
        name: payload.name,
        slug: payload.slug,
        icon: payload.icon,
        description: payload.description,
        display_order: payload.displayOrder,
        is_active: payload.isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new AppError(`Gagal memperbarui kategori: ${error.message}`, 500);
    return data;
  },

  async remove(id: string) {
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
    if (error) {
      if (error.code === "23503") {
        throw new AppError(
          "Kategori ini masih dipakai oleh produk dan tidak bisa dihapus. Nonaktifkan saja kategorinya.",
          409
        );
      }
      throw new AppError(`Gagal menghapus kategori: ${error.message}`, 500);
    }
  },
};
