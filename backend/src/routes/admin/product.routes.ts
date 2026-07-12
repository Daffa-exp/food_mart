import { Router } from "express";
import { productAdminController } from "../../controllers/product-admin.controller";
import { requireAdmin } from "../../middlewares/auth.middleware";

const router = Router();

router.use(requireAdmin);
router.get("/", productAdminController.list);
router.get("/:id", productAdminController.getById);
router.post("/", productAdminController.create);
router.patch("/:id", productAdminController.update);
router.delete("/:id", productAdminController.remove);
router.patch("/:id/active", productAdminController.setActive);
router.patch("/:id/stock", productAdminController.updateStock);

export default router;
