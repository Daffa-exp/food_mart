import { Request, Response, NextFunction } from "express";
import { bannerRepository } from "../repositories/banner.repository";

export const bannerController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await bannerRepository.listActive();
      const data = banners.map((b) => ({
        id: b.id,
        title: b.title,
        imageUrl: b.image_url,
        videoUrl: b.video_url,
        linkUrl: b.link_url,
        displayOrder: b.display_order,
      }));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
