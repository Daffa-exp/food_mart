import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin.from("settings").select("*");
    if (error) throw new AppError(error.message, 500);

    const settingsMap: Record<string, unknown> = {};
    for (const row of data ?? []) settingsMap[row.key] = row.value;
    res.json({ success: true, data: settingsMap });
  } catch (err) { next(err); }
});

router.patch("/:key", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value } = z.object({ value: z.record(z.unknown()) }).parse(req.body);
    const { error } = await supabaseAdmin
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", req.params.key);
    if (error) throw new AppError(`Gagal memperbarui setting: ${error.message}`, 500);
    res.json({ success: true, message: "Setting berhasil diperbarui" });
  } catch (err) { next(err); }
});

export default router;
