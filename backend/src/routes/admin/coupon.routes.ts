import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";
import { notificationRepository } from "../../repositories/notification.repository";

const couponSchema = z.object({
  code: z.string().min(3).transform((s) => s.toUpperCase()),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z.number().nonnegative(),
  minPurchase: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  isActive: z.boolean().default(true),
});

// Sama seperti Promotions: form admin cuma kirim "YYYY-MM-DD" tanpa jam, jadi
// tanggal selesai perlu digeser ke akhir hari (23:59:59) supaya kupon dengan
// tanggal mulai = selesai tidak dianggap expired begitu lewat tengah malam.
function toDayBoundary(dateStr: string | undefined, boundary: "start" | "end"): string | undefined {
  if (!dateStr) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return boundary === "start" ? `${dateStr}T00:00:00` : `${dateStr}T23:59:59`;
  }
  return dateStr;
}

function toRow(p: Partial<z.infer<typeof couponSchema>>) {
  return {
    code: p.code,
    description: p.description,
    type: p.type,
    value: p.value,
    min_purchase: p.minPurchase,
    max_discount: p.maxDiscount,
    usage_limit: p.usageLimit,
    valid_from: toDayBoundary(p.validFrom, "start"),
    valid_until: toDayBoundary(p.validUntil, "end"),
    is_active: p.isActive,
  };
}

function toDTO(row: Record<string, unknown>) {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type: row.type,
    value: Number(row.value),
    minPurchase: Number(row.min_purchase),
    maxDiscount: row.max_discount ? Number(row.max_discount) : null,
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    isActive: row.is_active,
  };
}

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data: (data ?? []).map(toDTO) });
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = couponSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("coupons").insert(toRow(payload)).select().single();
    if (error) throw new AppError(`Gagal membuat kupon: ${error.message}`, 500);

    if (payload.isActive) {
      const benefit =
        payload.type === "percentage"
          ? `diskon ${payload.value}%`
          : payload.type === "fixed_amount"
          ? `potongan Rp${payload.value.toLocaleString("id-ID")}`
          : "gratis ongkir";
      await notificationRepository.broadcastToAllCustomers({
        type: "promotion",
        title: "Ada kupon baru! 🎁",
        message: `Pakai kode ${payload.code} untuk ${benefit}. Buruan sebelum kuota habis!`,
        referenceId: data.id,
      });
    }

    res.status(201).json({ success: true, message: "Kupon berhasil dibuat", data: toDTO(data) });
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = couponSchema.partial().parse(req.body);
    const { data, error } = await supabaseAdmin.from("coupons").update(toRow(payload)).eq("id", req.params.id).select().single();
    if (error) throw new AppError(`Gagal memperbarui kupon: ${error.message}`, 500);
    res.json({ success: true, message: "Kupon berhasil diperbarui", data: toDTO(data) });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", req.params.id);
    if (error) throw new AppError(`Gagal menghapus kupon: ${error.message}`, 500);
    res.json({ success: true, message: "Kupon berhasil dihapus" });
  } catch (err) { next(err); }
});

export default router;
