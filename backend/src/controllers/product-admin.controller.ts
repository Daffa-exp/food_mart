import { Request, Response, NextFunction } from "express";
import { productRepository } from "../repositories/product.repository";
import { productAdminSchema, toProductRow } from "../validators/product-admin.validator";
import { toProductDTO, RawProductRow } from "../utils/transformers";
import { AppError } from "../middlewares/errorHandler";

export const productAdminController = {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productRepository.getByIdForAdmin(req.params.id);
      if (!product) throw new AppError("Produk tidak ditemukan", 404);

      const dto = toProductDTO(product as unknown as RawProductRow);
      res.json({
        success: true,
        data: {
          ...dto,
          categoryId: (product as unknown as { category_id: string }).category_id,
          isActive: (product as unknown as { is_active: boolean }).is_active,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, page, pageSize } = req.query;
      const result = await productRepository.listAllForAdmin({
        search: search as string | undefined,
        categorySlug: category as string | undefined,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });

      res.json({
        success: true,
        data: (result.data as unknown as RawProductRow[]).map((row) => ({
          ...toProductDTO(row),
          isActive: (row as unknown as { is_active: boolean }).is_active,
        })),
        pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = productAdminSchema.parse(req.body);
      const row = toProductRow(payload);
      const product = await productRepository.create(row);
      res.status(201).json({ success: true, message: "Produk berhasil dibuat", data: product });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = productAdminSchema.partial().parse(req.body);
      const row = toProductRow(payload);
      const product = await productRepository.update(req.params.id, row);
      res.json({ success: true, message: "Produk berhasil diperbarui", data: product });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await productRepository.remove(req.params.id);
      res.json({ success: true, message: "Produk berhasil dihapus" });
    } catch (err) {
      next(err);
    }
  },

  async setActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body as { isActive: boolean };
      await productRepository.setActive(req.params.id, isActive);
      res.json({ success: true, message: isActive ? "Produk diaktifkan" : "Produk dinonaktifkan" });
    } catch (err) {
      next(err);
    }
  },

  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantity, note } = req.body as { quantity: number; note?: string };
      if (typeof quantity !== "number" || quantity < 0) {
        throw new AppError("Jumlah stok harus berupa angka >= 0", 400);
      }
      await productRepository.updateStock(req.params.id, quantity, req.admin!.id, note);
      res.json({ success: true, message: "Stok berhasil diperbarui" });
    } catch (err) {
      next(err);
    }
  },
};
