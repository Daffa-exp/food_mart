import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";
import { notificationRepository } from "../../repositories/notification.repository";

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("*, users(full_name), products(name)")
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, 500);

    res.json({
      success: true,
      data: (data ?? []).map((r) => ({
        id: r.id,
        userName: (r.users as unknown as { full_name: string })?.full_name ?? "Pengguna",
        productName: (r.products as unknown as { name: string })?.name ?? "-",
        rating: r.rating,
        comment: r.comment,
        adminReply: r.admin_reply,
        isVisible: r.is_visible,
        createdAt: r.created_at,
      })),
    });
  } catch (err) { next(err); }
});

router.patch("/:id/reply", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reply } = z.object({ reply: z.string().min(1) }).parse(req.body);

    const { data: review, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select("user_id, products(name)")
      .eq("id", req.params.id)
      .single();
    if (fetchError || !review) throw new AppError("Ulasan tidak ditemukan", 404);

    const { error } = await supabaseAdmin.from("reviews").update({ admin_reply: reply }).eq("id", req.params.id);
    if (error) throw new AppError(`Gagal membalas ulasan: ${error.message}`, 500);

    const productName = (review.products as unknown as { name: string } | null)?.name ?? "produk kamu";
    await notificationRepository.create({
      userId: review.user_id as string,
      type: "review",
      title: "Admin membalas ulasan kamu",
      message: `Admin FoodMart membalas ulasan untuk "${productName}": "${reply}"`,
      referenceId: req.params.id,
    });

    res.json({ success: true, message: "Balasan berhasil dikirim" });
  } catch (err) { next(err); }
});

router.patch("/:id/visibility", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isVisible } = z.object({ isVisible: z.boolean() }).parse(req.body);
    const { error } = await supabaseAdmin.from("reviews").update({ is_visible: isVisible }).eq("id", req.params.id);
    if (error) throw new AppError(`Gagal mengubah visibilitas: ${error.message}`, 500);
    res.json({ success: true, message: isVisible ? "Ulasan ditampilkan" : "Ulasan disembunyikan" });
  } catch (err) { next(err); }
});

export default router;
