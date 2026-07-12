import { Router } from "express";
import { productController } from "../controllers/product.controller";

const router = Router();

router.get("/", productController.list);
router.get("/:slug", productController.getBySlug);

export default router;
