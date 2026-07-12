import { Request, Response, NextFunction } from "express";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { notificationRepository } from "../repositories/notification.repository";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
});

export const orderAdminController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, dateFrom, dateTo, page, pageSize } = req.query;
      const result = await orderRepository.listForAdmin({
        status: status as string | undefined,
        search: search as string | undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });

      res.json({
        success: true,
        data: result.data.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          status: o.status,
          customerName: (o.users as unknown as { full_name: string })?.full_name ?? o.recipient_name,
          customerEmail: (o.users as unknown as { email: string })?.email ?? "",
          totalAmount: Number(o.total_amount),
          itemCount: o.order_items?.length ?? 0,
          paymentStatus: (o.payments as unknown as { status: string }[])?.[0]?.status ?? "pending",
          createdAt: o.created_at,
        })),
        pagination: { total: result.total, page: result.page, pageSize: result.pageSize },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderRepository.findById(req.params.id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateStatusSchema.parse(req.body);
      const order = await orderRepository.findById(req.params.id);

      // Kalau order dibatalkan admin SETELAH stok sudah terpotong (order
      // sudah confirmed/processing/shipped), kembalikan stoknya.
      const stockAlreadyDeducted = ["confirmed", "processing", "shipped", "delivered"].includes(order.status);
      if (status === "cancelled" && stockAlreadyDeducted) {
        for (const item of order.order_items) {
          await productRepository.restoreStock(item.product_id, item.quantity);
        }
      }

      await orderRepository.updateStatus(req.params.id, status);

      await notificationRepository.create({
        userId: order.user_id,
        type: "order",
        title: statusNotificationTitle(status),
        message: `Pesanan #${order.order_number} ${statusNotificationMessage(status)}`,
        referenceId: order.id,
      });

      res.json({ success: true, message: `Status order diubah menjadi "${status}"` });
    } catch (err) {
      next(err);
    }
  },
};

function statusNotificationTitle(status: string): string {
  const map: Record<string, string> = {
    pending: "Pesanan menunggu pembayaran",
    confirmed: "Pesanan dikonfirmasi",
    processing: "Pesanan sedang diproses",
    shipped: "Pesanan dikirim 🚚",
    delivered: "Pesanan selesai 🎉",
    cancelled: "Pesanan dibatalkan",
    refunded: "Pesanan direfund",
  };
  return map[status] ?? "Status pesanan diperbarui";
}

function statusNotificationMessage(status: string): string {
  const map: Record<string, string> = {
    pending: "menunggu pembayaran dari kamu.",
    confirmed: "sudah dikonfirmasi dan akan segera disiapkan.",
    processing: "sedang disiapkan oleh dapur kami.",
    shipped: "sudah dalam perjalanan menuju kamu.",
    delivered: "sudah sampai. Selamat menikmati!",
    cancelled: "telah dibatalkan.",
    refunded: "telah direfund.",
  };
  return map[status] ?? `berubah status menjadi "${status}".`;
}
