import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = "1", pageSize = "20" } = req.query as Record<string, string>;
    const from = (Number(page) - 1) * Number(pageSize);
    const to = from + Number(pageSize) - 1;

    let query = supabaseAdmin.from("users").select("*", { count: "exact" });
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) throw new AppError(error.message, 500);

    res.json({
      success: true,
      data: (data ?? []).map((u) => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phoneNumber: u.phone_number,
        isEmailVerified: u.is_email_verified,
        isActive: u.is_active,
        createdAt: u.created_at,
      })),
      pagination: { total: count ?? 0, page: Number(page), pageSize: Number(pageSize) },
    });
  } catch (err) { next(err); }
});

router.patch("/:id/active", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const { error } = await supabaseAdmin.from("users").update({ is_active: isActive }).eq("id", req.params.id);
    if (error) throw new AppError(`Gagal mengubah status customer: ${error.message}`, 500);
    res.json({ success: true, message: isActive ? "Akun diaktifkan" : "Akun dinonaktifkan" });
  } catch (err) { next(err); }
});

export default router;
