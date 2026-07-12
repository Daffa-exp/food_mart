import { Router } from "express";
import { adminChatController } from "../../controllers/admin/chat.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();
router.use(requireAdmin);

router.get("/conversations", adminChatController.listConversations);
router.get("/conversations/:id/messages", adminChatController.listMessages);
router.post("/conversations/:id/messages", adminChatController.sendMessage);

export default router;
