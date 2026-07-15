import type {} from "./types/express"; // augmentasi req.user
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
// @ts-expect-error - tidak ada type definition resmi untuk xss-clean
import xssClean from "xss-clean";

import { env } from "./config/env";
import { notFoundHandler, globalErrorHandler } from "./middlewares/errorHandler";

// Router modules
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import notificationRoutes from "./routes/notification.routes";
import userRoutes from "./routes/user.routes";
import addressRoutes from "./routes/address.routes";
import reviewRoutes from "./routes/review.routes";
import chatRoutes from "./routes/chat.routes";
import bannerRoutes from "./routes/banner.routes";
import promotionRoutes from "./routes/promotion.routes";
// Admin Panel routes
import adminDashboardRoutes from "./routes/admin/dashboard.routes";
import adminAdminRoutes from "./routes/admin/admin.routes";
import adminProductRoutes from "./routes/admin/product.routes";
import adminUploadRoutes from "./routes/admin/upload.routes";
import adminCategoryRoutes from "./routes/admin/category.routes";
import adminOrderRoutes from "./routes/admin/order.routes";
import adminCouponRoutes from "./routes/admin/coupon.routes";
import adminPromotionRoutes from "./routes/admin/promotion.routes";
import adminBannerRoutes from "./routes/admin/banner.routes";
import adminReviewRoutes from "./routes/admin/review.routes";
import adminChatRoutes from "./routes/admin/chat.routes";
import adminCustomerRoutes from "./routes/admin/customer.routes";
import adminPaymentRoutes from "./routes/admin/payment.routes";
import adminSettingsRoutes from "./routes/admin/settings.routes";
import adminInventoryRoutes from "./routes/admin/inventory.routes";
import adminManagementRoutes from "./routes/admin/admin-management.routes";

const app = express();

// PENTING: Railway (seperti Vercel/Render/Heroku) menjalankan app di
// belakang reverse proxy. Tanpa baris ini, Express tidak "percaya" header
// X-Forwarded-For dari proxy tsb, yang membuat express-rate-limit di bawah
// gagal memvalidasi IP request dengan benar (lihat warning "ValidationError:
// X-Forwarded-For header is set but trust proxy is false" di log). Ini
// kemungkinan besar penyebab webhook Midtrans (yang datang dari jalur
// infrastruktur berbeda dari request browser biasa) gagal diproses dengan
// benar oleh middleware rate-limiter, sebelum sempat mencapai route handler.
app.set("trust proxy", 1);

// ---------- Security middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(hpp());
app.use(xssClean());

const limiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
  max: Number(env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak permintaan, coba lagi nanti." },
});
app.use("/api", limiter);

// ---------- Core middleware ----------
app.use(compression());
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// Catatan: berbeda dengan Stripe, verifikasi signature Midtrans TIDAK butuh
// raw body (dihitung dari order_id+status_code+gross_amount+ServerKey yang
// sudah ada di body JSON), sehingga express.json() global di bawah ini aman
// dipakai untuk endpoint webhook /api/payments/notification juga.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Health check ----------
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "FoodMart API is running", timestamp: new Date().toISOString() });
});

// ---------- API routes ----------
// Catatan: Auth (login/register) ditangani LANGSUNG oleh Supabase Auth SDK
// dari frontend (bukan lewat backend kita) — lihat frontend/services/supabase-client.ts.
// Backend hanya perlu memverifikasi JWT-nya (lihat middlewares/auth.middleware.ts).
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/promotions", promotionRoutes);

// ---------- Admin Panel routes (semua di-guard requireAdmin di masing-masing router) ----------
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin", adminAdminRoutes); // -> /api/admin/me
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/uploads", adminUploadRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);
app.use("/api/admin/promotions", adminPromotionRoutes);
app.use("/api/admin/banners", adminBannerRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/admin/chat", adminChatRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/admins", adminManagementRoutes);

// ---------- Error handling ----------
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
