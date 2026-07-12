import { Request, Response, NextFunction } from "express";
import { notificationRepository } from "../repositories/notification.repository";
import { userRepository } from "../repositories/user.repository";

async function resolveUserId(authId: string) {
  const user = await userRepository.findOrCreateByAuthId(authId);
  return user.id as string;
}

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      const rows = await notificationRepository.listByUserId(userId);
      const data = rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        referenceId: n.reference_id,
        createdAt: n.created_at,
      }));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      await notificationRepository.markAsRead(userId, req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      await notificationRepository.markAllAsRead(userId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};
