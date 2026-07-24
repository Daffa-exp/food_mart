import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { pushSubscriptionRepository } from "../repositories/push-subscription.repository";
import { userRepository } from "../repositories/user.repository";
import { requireAuth } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/errorHandler";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const router = Router();

// Publik — frontend butuh public key ini SEBELUM user login pun boleh
// (dipakai untuk registrasi subscription di browser), jadi tidak perlu auth.
router.get("/vapid-public-key", (_req: Request, res: Response) => {
  if (!env.VAPID_PUBLIC_KEY) {
    throw new AppError("Fitur notifikasi push belum dikonfigurasi di server", 503);
  }
  res.json({ success: true, data: { publicKey: env.VAPID_PUBLIC_KEY } });
});

router.use(requireAuth);

router.post("/subscribe", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = subscribeSchema.parse(req.body);
    const user = await userRepository.findOrCreateByAuthId(req.user!.authId);
    await pushSubscriptionRepository.save(user.id, payload, req.headers["user-agent"]);
    res.status(201).json({ success: true, message: "Notifikasi push diaktifkan" });
  } catch (err) {
    next(err);
  }
});

router.post("/unsubscribe", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { endpoint } = z.object({ endpoint: z.string().url() }).parse(req.body);
    await pushSubscriptionRepository.remove(endpoint);
    res.json({ success: true, message: "Notifikasi push dinonaktifkan" });
  } catch (err) {
    next(err);
  }
});

export default router;
