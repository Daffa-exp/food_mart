import { Router, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = "1", pageSize = "20" } = req.query as Record<string, string>;
    const from = (Number(page) - 1) * Number(pageSize);
    const to = from + Number(pageSize) - 1;

    let query = supabaseAdmin
      .from("payments")
      .select("*, orders(order_number, recipient_name)", { count: "exact" });
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) throw new AppError(error.message, 500);

    res.json({
      success: true,
      data: (data ?? []).map((p) => ({
        id: p.id,
        orderNumber: (p.orders as unknown as { order_number: string })?.order_number ?? "-",
        recipientName: (p.orders as unknown as { recipient_name: string })?.recipient_name ?? "-",
        paymentMethod: p.payment_method,
        status: p.status,
        grossAmount: Number(p.gross_amount),
        paidAt: p.paid_at,
        createdAt: p.created_at,
      })),
      pagination: { total: count ?? 0, page: Number(page), pageSize: Number(pageSize) },
    });
  } catch (err) { next(err); }
});

export default router;
