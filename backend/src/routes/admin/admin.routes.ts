import { Router } from "express";
import { adminController } from "../../controllers/admin.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

router.use(requireAdmin);
router.get("/me", adminController.getMe);

export default router;
