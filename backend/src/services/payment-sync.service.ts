import { midtransService, mapMidtransStatus } from "./midtrans.service";
import { paymentRepository } from "../repositories/payment.repository";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { notificationRepository } from "../repositories/notification.repository";

interface SyncableOrder {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  order_items?: { product_id: string; quantity: number }[];
  payments?: {
    id: string;
    status: string;
    midtrans_transaction_id?: string | null;
    midtrans_order_id?: string | null;
    payment_method?: string | null;
  }[];
}

export const paymentSyncService = {
  /**
   * Cek dan sinkronisasi status pembayaran langsung ke Midtrans API.
   * Dipanggil saat user membuka halaman detail order atau riwayat pesanan,
   * sehingga user tidak perlu menunggu webhook Midtrans tiba untuk melihat status terbaru.
   */
  async syncOrderPayment(order: SyncableOrder): Promise<SyncableOrder> {
    if (!order || order.status !== "pending") {
      return order;
    }

    const payment = order.payments?.[0];
    if (!payment || payment.status !== "pending") {
      return order;
    }

    // Identifiers yang mungkin dikenali oleh Midtrans
    const candidates: string[] = [];
    if (payment.midtrans_transaction_id) candidates.push(payment.midtrans_transaction_id);
    if (payment.midtrans_order_id) candidates.push(payment.midtrans_order_id);
    if (order.order_number) candidates.push(order.order_number);

    for (const lookupId of candidates) {
      try {
        const verified = await midtransService.getTransactionStatus(lookupId);
        if (!verified || !verified.transaction_status) continue;

        const mappedStatus = mapMidtransStatus(verified.transaction_status, verified.fraud_status);

        // Jika status masih pending di Midtrans, tidak perlu update DB
        if (mappedStatus === "pending") {
          return order;
        }

        // Update tabel payments
        await paymentRepository.updateStatus(payment.id, {
          status: mappedStatus,
          midtransTransactionId: verified.transaction_id,
          paymentMethod: verified.payment_type,
          paidAt: mappedStatus === "settlement" ? new Date().toISOString() : null,
          rawResponse: verified,
        });

        await paymentRepository.logStatusChange(payment.id, mappedStatus, verified);

        // Update status order & stok
        if (mappedStatus === "settlement") {
          await orderRepository.updateStatus(order.id, "confirmed");

          const items = order.order_items || [];
          if (items.length > 0) {
            await Promise.all(
              items.map((item) => productRepository.decrementStock(item.product_id, item.quantity))
            );
          }

          await notificationRepository.create({
            userId: order.user_id,
            type: "payment",
            title: "Pembayaran berhasil ✅",
            message: `Pembayaran untuk pesanan #${order.order_number} sudah kami terima. Pesanan akan segera diproses.`,
            referenceId: order.id,
          });
        } else if (["expire", "cancel", "failure"].includes(mappedStatus)) {
          await orderRepository.updateStatus(order.id, "cancelled");

          const reasonLabel: Record<string, string> = {
            expire: "kedaluwarsa (batas waktu bayar habis)",
            cancel: "dibatalkan",
            failure: "gagal diproses",
          };

          await notificationRepository.create({
            userId: order.user_id,
            type: "payment",
            title: "Pembayaran gagal ❌",
            message: `Pembayaran untuk pesanan #${order.order_number} ${reasonLabel[mappedStatus] || "gagal"}. Silakan coba buat pesanan baru.`,
            referenceId: order.id,
          });
        }

        // Ambil order terbaru dari database
        const updated = await orderRepository.findById(order.id);
        return updated as SyncableOrder;
      } catch {
        // Jika 404 dari Midtrans (transaksi belum diproses/dibuat di Midtrans), lanjut ke candidate berikutnya atau abaikan
      }
    }

    return order;
  },

  /**
   * Sinkronisasi beberapa order sekaligus (misal pada riwayat pesanan).
   */
  async syncPendingOrders(orders: SyncableOrder[]): Promise<SyncableOrder[]> {
    if (!orders || orders.length === 0) return orders;

    return Promise.all(
      orders.map(async (order) => {
        if (order.status === "pending") {
          try {
            return await this.syncOrderPayment(order);
          } catch {
            return order;
          }
        }
        return order;
      })
    );
  },
};
