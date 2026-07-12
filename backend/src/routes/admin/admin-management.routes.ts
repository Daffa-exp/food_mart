import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin, requireSuperAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";

const createAdminSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["admin", "super_admin"]).default("admin"),
});

const updateAdminSchema = z.object({
  fullName: z.string().min(3).optional(),
  role: z.enum(["admin", "super_admin"]).optional(),
  isActive: z.boolean().optional(),
});

const router = Router();
router.use(requireAdmin, requireSuperAdmin);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin.from("admins").select("*").order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, 500);

    res.json({
      success: true,
      data: (data ?? []).map((a) => ({
        id: a.id,
        fullName: a.full_name,
        email: a.email,
        role: a.role,
        isActive: a.is_active,
        lastLoginAt: a.last_login_at,
        createdAt: a.created_at,
      })),
    });
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createAdminSchema.parse(req.body);

    // Buat user Supabase Auth baru lewat Admin API (butuh service role key).
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
    });
    if (authError || !authUser.user) {
      throw new AppError(`Gagal membuat akun login: ${authError?.message}`, 500);
    }

    const { data, error } = await supabaseAdmin
      .from("admins")
      .insert({
        auth_id: authUser.user.id,
        full_name: payload.fullName,
        email: payload.email,
        role: payload.role,
      })
      .select()
      .single();

    if (error) {
      // Rollback: hapus auth user yang sudah terlanjur dibuat kalau insert admins gagal.
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new AppError(`Gagal membuat admin: ${error.message}`, 500);
    }

    res.status(201).json({
      success: true,
      message: "Admin baru berhasil dibuat",
      data: { id: data.id, fullName: data.full_name, email: data.email, role: data.role },
    });
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateAdminSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .from("admins")
      .update({ full_name: payload.fullName, role: payload.role, is_active: payload.isActive })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw new AppError(`Gagal memperbarui admin: ${error.message}`, 500);
    res.json({ success: true, message: "Admin berhasil diperbarui", data });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.admin!.id === req.params.id) {
      throw new AppError("Tidak bisa menghapus akun sendiri", 400);
    }
    const { data: admin } = await supabaseAdmin.from("admins").select("auth_id").eq("id", req.params.id).maybeSingle();
    const { error } = await supabaseAdmin.from("admins").delete().eq("id", req.params.id);
    if (error) throw new AppError(`Gagal menghapus admin: ${error.message}`, 500);

    if (admin?.auth_id) await supabaseAdmin.auth.admin.deleteUser(admin.auth_id);
    res.json({ success: true, message: "Admin berhasil dihapus" });
  } catch (err) { next(err); }
});

export default router;
