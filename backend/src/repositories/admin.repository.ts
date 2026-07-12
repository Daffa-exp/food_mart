import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const adminRepository = {
  async findByAuthId(authId: string) {
    const { data, error } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("auth_id", authId)
      .maybeSingle();
    if (error) throw new AppError(`Gagal mengambil data admin: ${error.message}`, 500);
    return data;
  },
};
