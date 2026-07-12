import { Request, Response, NextFunction } from "express";
import { promotionRepository } from "../repositories/promotion.repository";

export const promotionController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const promotions = await promotionRepository.listActive();
      const data = promotions.map((p) => {
        const product = p.products as unknown as { slug: string; name: string } | null;
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          bannerImageUrl: p.banner_image_url,
          discountPercentage: p.discount_percentage ? Number(p.discount_percentage) : null,
          endDate: p.end_date,
          productSlug: product?.slug ?? null,
          productName: product?.name ?? null,
        };
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
