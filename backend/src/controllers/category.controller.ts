import { Request, Response, NextFunction } from "express";
import { categoryRepository } from "../repositories/category.repository";

export const categoryController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryRepository.list();
      const data = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        displayOrder: c.display_order,
      }));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
