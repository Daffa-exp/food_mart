import { Router } from "express";
import { wishlistController } from "../controllers/wishlist.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", wishlistController.list);
router.post("/", wishlistController.add);
router.delete("/:productId", wishlistController.remove);

export default router;
