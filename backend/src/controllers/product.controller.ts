import { Request, Response, NextFunction } from "express";
import { productRepository } from "../repositories/product.repository";
import { toProductDTO, RawProductRow } from "../utils/transformers";
import { AppError } from "../middlewares/errorHandler";

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, sort, promo, bestSeller, isNew, page, pageSize } = req.query;

      const result = await productRepository.list({
        categorySlug: category as string | undefined,
        search: search as string | undefined,
        sort: sort as "terlaris" | "terbaru" | "harga_terendah" | "harga_tertinggi" | "rating" | undefined,
        isPromo: promo === "true",
        isBestSeller: bestSeller === "true",
        isNew: isNew === "true",
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });

      res.json({
        success: true,
        data: (result.data as unknown as RawProductRow[]).map(toProductDTO),
        pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
      });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productRepository.getBySlug(req.params.slug);
      if (!product) throw new AppError("Produk tidak ditemukan", 404);

      const dto = toProductDTO(product as unknown as RawProductRow);
      const relatedRaw = await productRepository.getRelated(dto.categorySlug, dto.id, 4);
      const related = (relatedRaw as unknown as RawProductRow[]).map(toProductDTO);

      res.json({ success: true, data: { ...dto, relatedProducts: related } });
    } catch (err) {
      next(err);
    }
  },
};
