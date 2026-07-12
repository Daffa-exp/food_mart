import { Request, Response, NextFunction } from "express";
import { wishlistRepository } from "../repositories/wishlist.repository";
import { userRepository } from "../repositories/user.repository";
import { toProductDTO, RawProductRow } from "../utils/transformers";

async function resolveUserId(authId: string) {
  const user = await userRepository.findOrCreateByAuthId(authId);
  return user.id as string;
}

export const wishlistController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      const rows = await wishlistRepository.listByUserId(userId);
      const data = rows.map((row) => ({
        wishlistId: row.id,
        addedAt: row.created_at,
        product: toProductDTO(row.product as unknown as RawProductRow),
      }));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      await wishlistRepository.add(userId, req.body.productId);
      res.status(201).json({ success: true, message: "Ditambahkan ke wishlist" });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      await wishlistRepository.remove(userId, req.params.productId);
      res.json({ success: true, message: "Dihapus dari wishlist" });
    } catch (err) {
      next(err);
    }
  },
};
