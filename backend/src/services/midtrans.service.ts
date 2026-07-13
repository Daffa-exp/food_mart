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
   *
   * PENTING: parameter ini harus transaction_id, BUKAN order_id kita sendiri.
   * Untuk metode DANA & BI-SNAP, Midtrans mewajibkan transaction_id di sini;
   * order_id tidak akan ditemukan meski transaksinya valid.
   */
  async getTransactionStatus(transactionId: string) {
    return coreApi.transaction.status(transactionId);
  },
};
