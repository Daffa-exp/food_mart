import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { paymentRepository } from "../repositories/payment.repository";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { midtransService, mapMidtransStatus } from "../services/midtrans.service";
import { notificationRepository } from "../repositories/notification.repository";
import { AppError } from "../middlewares/errorHandler";
import { supabaseAdmin } from "../config/supabase";

interface MidtransNotificationPayload {
  order_id: string; // ini order_number kita, bukan UUID
  transaction_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  payment_type?: string;
}

function verifySignature(payload: MidtransNotificationPayload): boolean {
  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${env.MIDTRANS_SERVER_KEY}`;
  const expectedSignature = crypto.createHash("sha512").update(raw).digest("hex");
  return expectedSignature === payload.signature_key;
}

export const paymentController = {
  /**
   * Webhook yang di-hit Midtrans setiap ada perubahan status transaksi.
   * Alur keamanan:
   *  1. Verifikasi signature_key (SHA512 dari order_id+status_code+gross_amount+ServerKey)
   *  2. Double-check status langsung ke Midtrans API (jangan percaya body notifikasi mentah)
   *  3. Update payment + order status, kurangi stok jika settlement
   *
   * PENTING soal timing: Midtrans membatasi berapa lama server kita boleh
   * "mikir" sebelum membalas — kalau kelamaan (misal >±10-15 detik), Midtrans
   * sudah keburu menandai notifikasi ini "Failed" walau proses kita di
   * belakang layar sebenarnya tetap sukses. Makanya di sini kita balas
   * `200 OK` SECEPATNYA begitu signature terverifikasi valid, lalu proses
   * pengecekan ulang + update database dilakukan di background (tidak
   * di-`await` sebelum respons dikirim).
   */
  async handleNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as MidtransNotificationPayload;

      if (!verifySignature(payload)) {
        throw new AppError("Signature tidak valid — notifikasi ditolak", 403);
      }

      // ACK duluan — supaya Midtrans tidak menunggu proses DB/stok/notifikasi
      // di bawah, yang bisa makan waktu beberapa detik.
      res.status(200).json({ success: true });

      processPaymentNotification(payload).catch((err) => {
        console.error("[payment webhook] Gagal memproses notifikasi di background:", err);
      });
    } catch (err) {
      next(err);
    }
  },

  async getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentRepository.findByOrderId(req.params.orderId);
      if (!payment) throw new AppError("Data pembayaran tidak ditemukan", 404);
      res.json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  },
};

async function processPaymentNotification(payload: MidtransNotificationPayload) {
  // Double-check ke Midtrans, jangan hanya percaya payload webhook.
  const verifiedStatus = await midtransService.getTransactionStatus(payload.order_id);
  const mappedStatus = mapMidtransStatus(verifiedStatus.transaction_status, verifiedStatus.fraud_status);

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", payload.order_id)
    .maybeSingle();

  if (error || !order) {
    throw new AppError(`Order dengan order_number ${payload.order_id} tidak ditemukan`, 404);
  }

  // Diambil terpisah (bukan lewat embedded join "orders(*, payments(*))")
  // supaya tidak bergantung pada bentuk balikan Supabase yang bisa jadi
  // array ATAU objek tunggal tergantung constraint FK — query langsung
  // ke tabel payments selalu jelas bentuknya (1 baris via .maybeSingle()).
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from("payments")
    .select("*")
    .eq("order_id", order.id)
    .maybeSingle();

  if (paymentError || !payment) {
    throw new AppError("Data payment tidak ditemukan untuk order ini", 404);
  }

  await paymentRepository.updateStatus(payment.id, {
    status: mappedStatus,
    midtransTransactionId: verifiedStatus.transaction_id,
    paymentMethod: verifiedStatus.payment_type,
    paidAt: mappedStatus === "settlement" ? new Date().toISOString() : null,
    rawResponse: verifiedStatus,
  });

  await paymentRepository.logStatusChange(payment.id, mappedStatus, verifiedStatus);

  // Update status order & kurangi stok HANYA saat pembayaran settlement,
  // supaya stok tidak berkurang untuk transaksi yang gagal/pending.
  if (mappedStatus === "settlement" && order.status === "pending") {
    await orderRepository.updateStatus(order.id, "confirmed");
    // Paralel (bukan satu-satu berurutan) — lebih cepat kalau item banyak.
    await Promise.all(
      order.order_items.map((item: { product_id: string; quantity: number }) =>
        productRepository.decrementStock(item.product_id, item.quantity)
      )
    );
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
      message: `Pembayaran untuk pesanan #${order.order_number} ${reasonLabel[mappedStatus]}. Silakan coba buat pesanan baru.`,
      referenceId: order.id,
    });
  }
}
