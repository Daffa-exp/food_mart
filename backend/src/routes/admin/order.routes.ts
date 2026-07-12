import { Router } from "express";
import { orderAdminController } from "../../controllers/order-admin.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

router.use(requireAdmin);
router.get("/", orderAdminController.list);
router.get("/:id", orderAdminController.getById);
router.patch("/:id/status", orderAdminController.updateStatus);

export default router;
