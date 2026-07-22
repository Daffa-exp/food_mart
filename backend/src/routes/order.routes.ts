import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Checkout WAJIB login — guest checkout sengaja dimatikan sesuai kebijakan
// toko (customer yang belum login hanya boleh melihat-lihat, tidak checkout).
router.post("/", requireAuth, orderController.createOrder);

// PENTING: /me harus didaftarkan SEBELUM /:id, kalau tidak "me" akan
// tertangkap sebagai parameter :id dan gagal (bukan UUID valid).
router.get("/me", requireAuth, orderController.getMyOrders);

// "Bayar Sekarang" untuk order pending yang sempat ditutup sebelum bayar.
// requireAuth (bukan optionalAuth) karena ini aksi yang mengubah data
// (generate token pembayaran baru), bukan sekadar melihat.
router.post("/:id/resume-payment", requireAuth, orderController.resumePayment);

// optionalAuth (bukan requireAuth): halaman Payment Success mengambil order
// ini dari Server Component (SSR) yang tidak membawa token sesi browser.
// Aman karena order ID adalah UUID v4 acak (tidak bisa ditebak) — pola yang
// sama seperti link "cek status pesanan" di email konfirmasi kebanyakan toko.
router.get("/:id", optionalAuth, orderController.getOrderById);

export default router;
