import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { reviewRepository } from "../repositories/review.repository";
import { userRepository } from "../repositories/user.repository";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/errorHandler";

const createReviewSchema = z.object({
  orderItemId: z.string().uuid("orderItemId tidak valid"),
  rating: z.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5"),
  comment: z.string().max(1000).optional(),
  photos: z.array(z.string().url()).max(5, "Maksimal 5 foto per ulasan").optional(),
});

function toDTO(row: Record<string, unknown>) {
  return {
    id: row.id,
    productId: row.product_id,
    orderItemId: row.order_item_id,
    rating: row.rating,
    comment: row.comment,
    photos: row.photos ?? [],
    adminReply: row.admin_reply,
    createdAt: row.created_at,
  };
}

const router = Router();

// Publik: lihat ulasan sebuah produk (dipakai di halaman detail produk).
router.get("/", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.query as { productId?: string };
    if (!productId) throw new AppError("productId wajib diisi", 400);

    const rows = await reviewRepository.listByProduct(productId);
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        userName: (r.users as unknown as { full_name: string } | null)?.full_name ?? "Pengguna",
        rating: r.rating,
        comment: r.comment,
        photos: r.photos ?? [],
        adminReply: r.admin_reply,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.use(requireAuth);

// Ulasan milik user yang sedang login — dipakai halaman "Pesanan Saya" untuk
// tahu item mana yang sudah diberi rating (supaya tombolnya jadi "Lihat Rating").
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userRepository.findOrCreateByAuthId(req.user!.authId);
    const rows = await reviewRepository.listMine(user.id);
    res.json({ success: true, data: rows.map(toDTO) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userRepository.findOrCreateByAuthId(req.user!.authId);
    const payload = createReviewSchema.parse(req.body);

    const orderItem = await reviewRepository.findOrderItemForReview(user.id, payload.orderItemId);
    if (!orderItem) {
      throw new AppError("Item pesanan tidak ditemukan atau bukan milik Anda", 404);
    }
    if (orderItem.orderStatus !== "delivered") {
      throw new AppError("Pesanan baru bisa diberi rating setelah statusnya \"Pesanan Selesai\"", 400);
    }

    const review = await reviewRepository.create(user.id, {
      productId: orderItem.productId,
      orderItemId: payload.orderItemId,
      rating: payload.rating,
      comment: payload.comment,
      photos: payload.photos,
    });

    res.status(201).json({ success: true, message: "Terima kasih atas rating & komentarnya!", data: toDTO(review) });
  } catch (err) {
    next(err);
  }
});

export default router;
