import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const addressRepository = {
  async listByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("shipping_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new AppError(`Gagal mengambil alamat: ${error.message}`, 500);
    return data ?? [];
  },

  async create(userId: string, payload: Record<string, unknown>) {
    // Kalau ini alamat pertama, otomatis jadi default.
    const existing = await this.listByUserId(userId);
    const isDefault = existing.length === 0 ? true : !!payload.isDefault;

    if (isDefault) await this.clearDefault(userId);

    const { data, error } = await supabaseAdmin
      .from("shipping_addresses")
      .insert({
        user_id: userId,
        recipient_name: payload.recipientName,
        phone_number: payload.phoneNumber,
        full_address: payload.fullAddress,
        address_note: payload.addressNote,
        city: payload.city,
        postal_code: payload.postalCode,
        is_default: isDefault,
      })
      .select()
      .single();
    if (error) throw new AppError(`Gagal menyimpan alamat: ${error.message}`, 500);
    return data;
  },

  async update(userId: string, id: string, payload: Record<string, unknown>) {
    if (payload.isDefault) await this.clearDefault(userId);

    const { data, error } = await supabaseAdmin
      .from("shipping_addresses")
      .update({
        recipient_name: payload.recipientName,
        phone_number: payload.phoneNumber,
        full_address: payload.fullAddress,
        address_note: payload.addressNote,
        city: payload.city,
        postal_code: payload.postalCode,
        is_default: payload.isDefault,
      })
      .eq("id", id)
      .eq("user_id", userId) // pastikan user hanya bisa edit alamat miliknya sendiri
      .select()
      .single();
    if (error) throw new AppError(`Gagal memperbarui alamat: ${error.message}`, 500);
    return data;
  },

  async remove(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from("shipping_addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new AppError(`Gagal menghapus alamat: ${error.message}`, 500);
  },

  async clearDefault(userId: string) {
    await supabaseAdmin.from("shipping_addresses").update({ is_default: false }).eq("user_id", userId);
  },

  async setDefault(userId: string, id: string) {
    await this.clearDefault(userId);
    const { error } = await supabaseAdmin
      .from("shipping_addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new AppError(`Gagal menjadikan alamat utama: ${error.message}`, 500);
  },
};
