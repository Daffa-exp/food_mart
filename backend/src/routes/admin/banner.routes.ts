import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";

const bannerBaseSchema = z.object({
  title: z.string().optional(),
  imageUrl: z.string().trim().url("URL gambar tidak valid (harus diawali https://)").optional().or(z.literal("")),
  videoUrl: z.string().trim().url("URL video tidak valid (harus diawali https://)").optional().or(z.literal("")),
  linkUrl: z.string().trim().url().optional().or(z.literal("")),
  displayOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Dipakai saat membuat banner baru — minimal salah satu (gambar/video) harus diisi.
const bannerSchema = bannerBaseSchema.refine((data) => !!data.imageUrl || !!data.videoUrl, {
  message: "Isi minimal salah satu: gambar banner atau link video",
  path: ["imageUrl"],
});

function toRow(p: Partial<z.infer<typeof bannerBaseSchema>>) {
  return {
    title: p.title,
    image_url: p.imageUrl || null,
    video_url: p.videoUrl || null,
    link_url: p.linkUrl || null,
    display_order: p.displayOrder,
    is_active: p.isActive,
    start_date: p.startDate,
    end_date: p.endDate,
  };
}

function toDTO(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    videoUrl: row.video_url,
    linkUrl: row.link_url,
    displayOrder: row.display_order,
    isActive: row.is_active,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin.from("banners").select("*").order("display_order", { ascending: true });
    if (error) throw new AppError(error.message, 500);
    res.json({ success: true, data: (data ?? []).map(toDTO) });
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = bannerSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("banners").insert(toRow(payload)).select().single();
    if (error) throw new AppError(`Gagal membuat banner: ${error.message}`, 500);
    res.status(201).json({ success: true, message: "Banner berhasil dibuat", data: toDTO(data) });
  } catch (err) { next(err); }
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = bannerBaseSchema.partial().parse(req.body);
    const { data, error } = await supabaseAdmin.from("banners").update(toRow(payload)).eq("id", req.params.id).select().single();
    if (error) throw new AppError(`Gagal memperbarui banner: ${error.message}`, 500);
    res.json({ success: true, message: "Banner berhasil diperbarui", data: toDTO(data) });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin.from("banners").delete().eq("id", req.params.id);
    if (error) throw new AppError(`Gagal menghapus banner: ${error.message}`, 500);
    res.json({ success: true, message: "Banner berhasil dihapus" });
  } catch (err) { next(err); }
});

export default router;
