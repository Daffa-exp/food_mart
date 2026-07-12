import midtransClient from "midtrans-client";
import { env } from "../config/env";

const snap = new midtransClient.Snap({
  isProduction: env.MIDTRANS_IS_PRODUCTION,
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});

const coreApi = new midtransClient.CoreApi({
  isProduction: env.MIDTRANS_IS_PRODUCTION,
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});

export interface SnapTransactionInput {
  orderId: string; // pakai order_number, bukan UUID internal, agar rapi di dashboard Midtrans
  internalOrderId: string; // UUID asli — dipakai untuk redirect balik ke halaman kita
  grossAmount: number;
  customer: {
    firstName: string;
    email: string;
    phone: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

/**
 * Mapping status transaksi_status dari Midtrans ke enum payment_status kita.
 * Referensi: https://docs.midtrans.com/docs/https-notification-webhooks
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): "pending" | "settlement" | "expire" | "cancel" | "failure" | "challenge" | "refund" {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "challenge" : "settlement";
    case "settlement":
      return "settlement";
    case "pending":
      return "pending";
    case "deny":
      return "failure";
    case "cancel":
      return "cancel";
    case "expire":
      return "expire";
    case "refund":
    case "partial_refund":
      return "refund";
    default:
      return "failure";
  }
}

export const midtransService = {
  async createSnapTransaction(input: SnapTransactionInput) {
    const parameter = {
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.grossAmount,
      },
      customer_details: {
        first_name: input.customer.firstName,
        email: input.customer.email,
        phone: input.customer.phone,
      },
      item_details: input.items.map((item) => ({
        id: item.id,
        name: item.name.slice(0, 50), // Midtrans membatasi 50 karakter
        price: item.price,
        quantity: item.quantity,
      })),
      // Sebagian metode bayar (GoPay, QRIS, VA, dsb) tidak selesai lewat
      // callback JS onSuccess — Midtrans redirect browser langsung ke URL
      // "finish" ini dan otomatis menempelkan `order_id` versi MEREKA
      // (= order_number kita) di query string. Kalau tidak di-set eksplisit
      // di sini, Midtrans pakai default dari dashboard yang query param-nya
      // bentrok sama `order_id` UUID yang dipakai halaman kita → salah ambil
      // order. Jadi arahkan langsung ke UUID asli supaya konsisten dengan
      // alur onSuccess di popup.
      callbacks: {
        finish: `${env.CLIENT_URL}/checkout/berhasil?order_id=${input.internalOrderId}`,
        error: `${env.CLIENT_URL}/checkout/berhasil?order_id=${input.internalOrderId}`,
        pending: `${env.CLIENT_URL}/checkout/berhasil?order_id=${input.internalOrderId}`,
      },
      // Semua metode di bawah ini diaktifkan di Midtrans Dashboard Sandbox,
      // enabled_payments opsional dikosongkan agar Snap menampilkan semua
      // metode yang aktif di akun (QRIS, GoPay, ShopeePay, DANA, OVO,
      // Bank Transfer/VA, Kartu Kredit).
    };

    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token as string,
      redirectUrl: transaction.redirect_url as string,
    };
  },

  /**
   * Verifikasi status transaksi langsung ke Midtrans (dipanggil dari webhook
   * handler untuk double-check, bukan hanya percaya payload notifikasi mentah
   * — praktik keamanan standar Midtrans).
   */
  async getTransactionStatus(orderId: string) {
    return coreApi.transaction.status(orderId);
  },
};
