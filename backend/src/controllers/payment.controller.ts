import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { paymentRepository } from "../repositories/payment.repository";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { notificationRepository } from "../repositories/notification.repository";
import { midtransService, mapMidtransStatus } from "../services/midtrans.service";
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
  //
  // PENTING: WAJIB pakai transaction_id di sini, BUKAN order_id (order_number
  // kita). Untuk metode DANA (dan BI-SNAP lainnya), Midtrans mewajibkan
  // transaction_id untuk endpoint status — order_id akan selalu dibalas
  // "Transaction doesn't exist" 404 meski transaksinya valid & settlement.
  let verifiedStatus;
  try {
    verifiedStatus = await midtransService.getTransactionStatus(payload.transaction_id);
  } catch (midtransErr) {
    // PENTING: sebelumnya error apapun dari Midtrans (termasuk transaksi
    // lama/expired yang sudah tidak ada di sisi Midtrans — respons 404
    // "Transaction doesn't exist") membuat proses ini gagal total tanpa
    // penanganan khusus. Untuk kasus "transaksi tidak ditemukan", ini bukan
    // error yang perlu di-treat serius — cukup anggap notifikasi ini bisa
    // diabaikan (respons ke Midtrans sudah terkirim duluan di atas).
    const httpStatusCode = (midtransErr as { httpStatusCode?: string })?.httpStatusCode;
    if (httpStatusCode === "404") {
      // PENTING: JANGAN otomatis mengubah status order jadi cancelled di
      // sini. Sandbox Midtrans kadang mengirim notifikasi duplikat atau
      // lebih awal sebelum transaksi benar-benar ter-index di sisi mereka
      // (race condition) — kalau order langsung ditandai cancelled saat
      // itu, notifikasi "settlement" asli yang menyusul TIDAK akan
      // mengubahnya lagi jadi confirmed (karena kode di bawah hanya update
      // kalau status order masih "pending"), sehingga order yang sebenarnya
      // berhasil malah nyangkut di status cancelled selamanya.
      console.warn(
        `[Midtrans] Transaksi ${payload.order_id} belum/tidak ditemukan di Midtrans, notifikasi diabaikan tanpa mengubah status order.`
      );
      return;
    }
    throw midtransErr;
  }

  const mappedStatus = mapMidtransStatus(verifiedStatus.transaction_status, verifiedStatus.fraud_status);

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", payload.order_id)
    .maybeSingle();

  if (error || !order) {
    throw new AppError(`Order dengan order_number ${payload.order_id} tidak ditemukan`, 404);
  }

  // PENTING: diambil terpisah (bukan lewat embedded join
  // "orders(*, payments(*))") supaya tidak bergantung pada bentuk balikan
  // Supabase yang bisa jadi ARRAY atau OBJEK TUNGGAL tergantung constraint
  // FK antara orders <-> payments. Kalau relasinya one-to-one (unique FK),
  // Supabase balikin payments sebagai objek tunggal, sehingga
  // "order.payments?.[0]" akan SELALU undefined walau data payment-nya ada
  // — ini penyebab error "Data payment tidak ditemukan" yang salah. Query
  // langsung ke tabel payments selalu jelas bentuknya (1 baris via
  // .maybeSingle()), jadi aman dari ambiguitas ini.
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