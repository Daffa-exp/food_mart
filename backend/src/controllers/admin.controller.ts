import { Request, Response, NextFunction } from "express";
import { adminRepository } from "../repositories/admin.repository";
import { AppError } from "../middlewares/errorHandler";

export const adminController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await adminRepository.findByAuthId(req.user!.authId);
      if (!admin) throw new AppError("Data admin tidak ditemukan", 404);

      res.json({
        success: true,
        data: {
          id: admin.id,
          fullName: admin.full_name,
          email: admin.email,
          avatarUrl: admin.avatar_url,
          role: admin.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
