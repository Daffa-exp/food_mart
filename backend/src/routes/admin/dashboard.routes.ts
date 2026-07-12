import { Router } from "express";
import { dashboardController } from "../../controllers/dashboard.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

router.use(requireAdmin);
router.get("/summary", dashboardController.summary);

export default router;
