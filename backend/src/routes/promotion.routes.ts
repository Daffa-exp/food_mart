import { Router } from "express";
import { promotionController } from "../controllers/promotion.controller";

const router = Router();

router.get("/", promotionController.list);

export default router;
