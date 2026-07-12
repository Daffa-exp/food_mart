import { Request, Response, NextFunction } from "express";
import { dashboardRepository } from "../repositories/dashboard.repository";

export const dashboardController = {
  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const since30d = new Date();
      since30d.setDate(since30d.getDate() - 30);

      const [revenue, statusCounts, bestSellers, recentOrders, dailyRevenue] = await Promise.all([
        dashboardRepository.getRevenueSummary(since30d),
        dashboardRepository.getOrderStatusCounts(),
        dashboardRepository.getBestSellingProducts(5),
        dashboardRepository.getRecentOrders(8),
        dashboardRepository.getDailyRevenue(14),
      ]);

      res.json({
        success: true,
        data: {
          revenue30Days: revenue.totalRevenue,
          orders30Days: revenue.totalOrders,
          orderStatusCounts: statusCounts,
          bestSellers: bestSellers.map((p) => ({
            id: p.id,
            name: p.name,
            soldCount: p.sold_count,
            price: Number(p.final_price),
            imageUrl:
              (p.images as { image_url: string; is_primary: boolean }[])?.find((i) => i.is_primary)
                ?.image_url ?? (p.images as { image_url: string }[])?.[0]?.image_url ?? null,
          })),
          recentOrders: recentOrders.map((o) => ({
            id: o.id,
            orderNumber: o.order_number,
            recipientName: o.recipient_name,
            status: o.status,
            totalAmount: Number(o.total_amount),
            paymentStatus: (o.payments as unknown as { status: string }[])?.[0]?.status ?? "pending",
            createdAt: o.created_at,
          })),
          dailyRevenueChart: Object.entries(dailyRevenue).map(([date, total]) => ({ date, total })),
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
