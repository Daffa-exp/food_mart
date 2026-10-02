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
  internalOrderId: string; // UUID asli di database kita, dipakai untuk redirect balik setelah bayar
  grossAmount: number;
  clientUrl?: string;
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
    const baseUrl = (input.clientUrl || env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
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
      callbacks: {
        finish: `${baseUrl}/checkout/berhasil?order_id=${input.internalOrderId}`,
        unfinish: `${baseUrl}/checkout/berhasil?order_id=${input.internalOrderId}`,
        error: `${baseUrl}/checkout/berhasil?order_id=${input.internalOrderId}`,
      },
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
   *
   * PENTING: parameter ini harus transaction_id, BUKAN order_id kita sendiri.
   * Untuk metode DANA & BI-SNAP, Midtrans mewajibkan transaction_id di sini;
   * order_id tidak akan ditemukan meski transaksinya valid.
   */
  async getTransactionStatus(transactionId: string) {
    return coreApi.transaction.status(transactionId);
  },
};
