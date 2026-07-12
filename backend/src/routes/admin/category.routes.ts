import { Router } from "express";
import { categoryAdminController } from "../../controllers/category-admin.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

router.use(requireAdmin);
router.get("/", categoryAdminController.list);
router.post("/", categoryAdminController.create);
router.patch("/:id", categoryAdminController.update);
router.delete("/:id", categoryAdminController.remove);

export default router;
