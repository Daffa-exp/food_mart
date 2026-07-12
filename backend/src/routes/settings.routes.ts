import { Router, Request, Response, NextFunction } from "express";
import { getPricingSettings } from "../utils/pricing";

const router = Router();

// Publik (tanpa login) — dipakai halaman Checkout supaya preview ongkir &
// biaya layanan yang dilihat customer SELALU sama dengan yang dipakai
// backend saat order beneran dibuat (satu sumber data: tabel `settings`).
router.get("/pricing", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pricing = await getPricingSettings();
    res.json({
      success: true,
      data: {
        shippingFee: pricing.shippingFee,
        freeShippingMinPurchase: pricing.freeShippingMinPurchase,
        serviceFee: pricing.serviceFee,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
