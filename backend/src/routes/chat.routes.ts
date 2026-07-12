import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
router.use(requireAuth);

router.get("/conversations", chatController.listConversations);
router.post("/conversations", chatController.openConversation);
router.get("/conversations/:id/messages", chatController.listMessages);
router.post("/conversations/:id/messages", chatController.sendMessage);

export default router;
