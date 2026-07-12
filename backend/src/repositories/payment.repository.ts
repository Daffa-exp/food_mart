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

  async logStatusChange(paymentId: string, status: string, payload: unknown) {
    const { error } = await supabaseAdmin.from("payment_logs").insert({
      payment_id: paymentId,
      status,
      notification_payload: payload,
    });
    if (error) throw new AppError(`Gagal mencatat log pembayaran: ${error.message}`, 500);
  },
};
