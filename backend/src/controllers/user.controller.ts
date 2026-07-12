import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../middlewares/errorHandler";

const updateProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  phoneNumber: z.string().min(9).optional(),
  avatarUrl: z.string().url().optional(),
});

export const userController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findOrCreateByAuthId(req.user!.authId);

      res.json({
        success: true,
        data: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
          avatarUrl: user.avatar_url,
          isEmailVerified: user.is_email_verified,
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateProfileSchema.parse(req.body);
      await userRepository.findOrCreateByAuthId(req.user!.authId);
      const user = await userRepository.updateProfile(req.user!.authId, payload);
      res.json({
        success: true,
        message: "Profil berhasil diperbarui",
        data: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
          avatarUrl: user.avatar_url,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
