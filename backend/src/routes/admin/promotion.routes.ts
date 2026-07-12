import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";
import { notificationRepository } from "../../repositories/notification.repository";

const promotionSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  bannerImageUrl: z.string().trim().url().optional().or(z.literal("")),
  productId: z.string().uuid().optional().or(z.literal("")),
  discountPercentage: z.number().min(0).max(100).optional(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().default(true),
});

// Form admin pakai <input type="date"> yang cuma kirim "YYYY-MM-DD" tanpa jam.
// Kalau langsung disimpan apa adanya, Postgres menganggapnya jam 00:00:00 —
// jadi promo dengan tanggal mulai = selesai (mis. "9/7/2026 - 9/7/2026")
// otomatis dianggap sudah lewat begitu jam 00:00 lewat, padahal baru dibuat
// beberapa jam sebelumnya. Di sini kita normalisasi: tanggal mulai jadi awal
// hari (00:00:00), tanggal selesai jadi AKHIR hari (23:59:59) supaya promo
// tetap tampil sepanjang hari yang dipilih admin.
function toDayBoundary(dateStr: string | undefined, boundary: "start" | "end"): string | undefined {
  if (!dateStr) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return boundary === "start" ? `${dateStr}T00:00:00` : `${dateStr}T23:59:59`;
  }
  return dateStr;
}

function toRow(p: Partial<z.infer<typeof promotionSchema>>) {
  return {
    title: p.title,
    description: p.description,
    banner_image_url: p.bannerImageUrl,
    product_id: p.productId,
    discount_percentage: p.discountPercentage,
    start_date: toDayBoundary(p.startDate, "start"),
    end_date: toDayBoundary(p.endDate, "end"),
    is_active: p.isActive,
  };
}

function toDTO(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    bannerImageUrl: row.banner_image_url,
    productId: row.product_id,
    discountPercentage: row.discount_percentage ? Number(row.discount_percentage) : null,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
  };
}

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin.from("promotions").select("*").order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data: (data ?? []).map(toDTO) });
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = promotionSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("promotions").insert(toRow(payload)).select().single();
    if (error) throw new AppError(`Gagal membuat promosi: ${error.message}`, 500);

    if (payload.isActive) {
      const discountText = payload.discountPercentage ? ` diskon ${payload.discountPercentage}%` : "";
      await notificationRepository.broadcastToAllCustomers({
        type: "promotion",
        title: "Promo baru untukmu! 🎉",
        message: `${payload.title}${discountText} — cek sekarang sebelum kehabisan!`,
        referenceId: data.id,
      });
    }

    res.status(201).json({ success: true, message: "Promosi berhasil dibuat", data: toDTO(data) });
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = promotionSchema.partial().parse(req.body);
    const { data, error } = await supabaseAdmin.from("promotions").update(toRow(payload)).eq("id", req.params.id).select().single();
    if (error) throw new AppError(`Gagal memperbarui promosi: ${error.message}`, 500);
    res.json({ success: true, message: "Promosi berhasil diperbarui", data: toDTO(data) });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin.from("promotions").delete().eq("id", req.params.id);
    if (error) throw new AppError(`Gagal menghapus promosi: ${error.message}`, 500);
    res.json({ success: true, message: "Promosi berhasil dihapus" });
  } catch (err) { next(err); }
});

export default router;
