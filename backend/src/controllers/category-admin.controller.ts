import { Request, Response, NextFunction } from "express";
import { categoryRepository } from "../repositories/category.repository";
import { categoryAdminSchema } from "../validators/category-admin.validator";

export const categoryAdminController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryRepository.listAllForAdmin();
      res.json({
        success: true,
        data: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          description: c.description,
          displayOrder: c.display_order,
          isActive: c.is_active,
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = categoryAdminSchema.parse(req.body);
      const category = await categoryRepository.create(payload);
      res.status(201).json({ success: true, message: "Kategori berhasil dibuat", data: category });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = categoryAdminSchema.partial().parse(req.body);
      const category = await categoryRepository.update(req.params.id, payload);
      res.json({ success: true, message: "Kategori berhasil diperbarui", data: category });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryRepository.remove(req.params.id);
      res.json({ success: true, message: "Kategori berhasil dihapus" });
    } catch (err) {
      next(err);
    }
  },
};
