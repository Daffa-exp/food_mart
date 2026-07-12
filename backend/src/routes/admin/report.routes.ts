import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { reportExportController } from "../../controllers/report-export.controller";

const router = Router();

router.use(requireAdmin);
router.get("/export/excel", reportExportController.excel);
router.get("/export/pdf", reportExportController.pdf);

export default router;
