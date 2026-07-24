import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export const paymentRepository = {
  async create(input: {
    orderId: string;
    snapToken: string;
    grossAmount: number;
    expiredAt?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: input.orderId,
        snap_token: input.snapToken,
        gross_amount: input.grossAmount,
        status: "pending",
        expired_at: input.expiredAt,
      })
      .select()
      .single();

    if (error) throw new AppError(`Gagal menyimpan data pembayaran: ${error.message}`, 500);
    return data;
  },

  async findByOrderId(orderId: string) {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (error) throw new AppError(`Gagal mengambil data pembayaran: ${error.message}`, 500);
    return data;
  },

  async findByMidtransTransactionId(transactionId: string) {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("*, orders(*)")
      .eq("midtrans_transaction_id", transactionId)
      .maybeSingle();

    if (error) throw new AppError(`Gagal mengambil data pembayaran: ${error.message}`, 500);
    return data;
  },

  async updateStatus(
    paymentId: string,
    update: {
      status: string;
      midtransTransactionId?: string;
      paymentMethod?: string;
      paidAt?: string | null;
      rawResponse?: unknown;
    }
  ) {
    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: update.status,
        midtrans_transaction_id: update.midtransTransactionId,
        payment_method: update.paymentMethod,
        paid_at: update.paidAt,
        raw_response: update.rawResponse,
      })
      .eq("id", paymentId);

    if (error) throw new AppError(`Gagal memperbarui status pembayaran: ${error.message}`, 500);
  },

  async updateSnapToken(paymentId: string, snapToken: string, midtransOrderId?: string) {
    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        snap_token: snapToken,
        ...(midtransOrderId ? { midtrans_order_id: midtransOrderId } : {}),
      })
      .eq("id", paymentId);
    if (error) throw new AppError(`Gagal memperbarui token pembayaran: ${error.message}`, 500);
  },

  // Dipakai webhook sebagai fallback: kalau order_id dari notifikasi
  // Midtrans TIDAK cocok dengan orders.order_number manapun (karena ini
  // order_id hasil retry "Bayar Sekarang", bukan order_id transaksi
  // pertama), cari lewat kolom midtrans_order_id ini.
  async findOrderIdByMidtransOrderId(midtransOrderId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("order_id")
      .eq("midtrans_order_id", midtransOrderId)
      .maybeSingle();
    if (error) throw new AppError(`Gagal mencari order dari midtrans_order_id: ${error.message}`, 500);
    return data?.order_id ?? null;
  },

  async logStatusChange(paymentId: string, status: string, payload: unknown) {
    const { error } = await supabaseAdmin.from("payment_logs").insert({
      payment_id: paymentId,
      status,
      notification_payload: payload,
    });
    if (error) throw new AppError(`Gagal mencatat log pembayaran: ${error.message}`, 500);
  },
};
