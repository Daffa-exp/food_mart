import { Router, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../../config/supabase";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { AppError } from "../../middlewares/errorHandler";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lowStockOnly } = req.query as Record<string, string>;

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, is_active, inventory(stock_quantity, low_stock_threshold)")
      .order("name", { ascending: true });
    if (error) throw new AppError(error.message, 500);

    let mapped = (data ?? []).map((p) => {
      const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
      return {
        productId: p.id,
        name: p.name,
        slug: p.slug,
        isActive: p.is_active,
        stockQuantity: inv?.stock_quantity ?? 0,
        lowStockThreshold: inv?.low_stock_threshold ?? 10,
        isLowStock: (inv?.stock_quantity ?? 0) <= (inv?.low_stock_threshold ?? 10),
      };
    });

    if (lowStockOnly === "true") mapped = mapped.filter((p) => p.isLowStock);

    res.json({ success: true, data: mapped });
  } catch (err) { next(err); }
});

router.get("/logs/:productId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("stock_logs")
      .select("*, admins(full_name)")
      .eq("product_id", req.params.productId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new AppError(error.message, 500);

    res.json({
      success: true,
      data: (data ?? []).map((log) => ({
        id: log.id,
        movementType: log.movement_type,
        quantity: log.quantity,
        note: log.note,
        adminName: (log.admins as unknown as { full_name: string })?.full_name ?? "Sistem",
        createdAt: log.created_at,
      })),
    });
  } catch (err) { next(err); }
});

export default router;
