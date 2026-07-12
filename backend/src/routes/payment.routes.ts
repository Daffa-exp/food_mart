import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";

const router = Router();

// Endpoint ini dipanggil oleh server Midtrans (bukan browser), maka TIDAK
// pakai middleware auth. Keamanan dijamin lewat verifikasi signature_key
// dan double-check status ke Midtrans API di dalam controller.
router.post("/notification", paymentController.handleNotification);

router.get("/:orderId/status", paymentController.getPaymentStatus);

export default router;
