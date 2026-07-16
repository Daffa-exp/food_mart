"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

interface OrderPaymentLike {
  status: string;
  payments?: { status: string; payment_method: string | null }[];
}

// PENTING: queryKey ["order-status-live", orderId] SENGAJA dibuat sama
// persis dengan queryKey di OrderStatusLive.tsx. React Query men-dedupe
// query dengan key yang sama di bawah QueryClientProvider yang sama —
// jadi walau komponen ini dipakai berdampingan dengan OrderStatusLive di
// halaman yang sama, keduanya berbagi 1 polling interval (bukan dobel
// request tiap 15 detik). Kalau queryKey di salah satu file diubah,
// UBAH JUGA di file satunya, atau sinkronisasi ini akan rusak diam-diam.
export default function PaymentInfoLive({
  orderId,
  initialStatus,
  initialIsPaid,
  initialPaymentMethod,
  initialPaymentStatus,
}: {
  orderId: string;
  initialStatus: string;
  initialIsPaid: boolean;
  initialPaymentMethod: string | null;
  initialPaymentStatus?: string | null;
}) {
  const { data } = useQuery({
    queryKey: ["order-status-live", orderId],
    queryFn: () => orderService.getOrderById(orderId) as Promise<OrderPaymentLike>,
    refetchInterval: 15_000,
    initialData: {
      status: initialStatus,
      payments: [
        {
          status: initialPaymentStatus ?? (initialIsPaid ? "settlement" : "pending"),
          payment_method: initialPaymentMethod,
        },
      ],
    },
  });

  const payment = data?.payments?.[0];
  const payStatus = payment?.status;
  const isPaid = payStatus === "settlement";
  const isFailed = payStatus === "deny" || payStatus === "cancel" || payStatus === "expire";
  const label = isPaid ? "Berhasil" : isFailed ? "Gagal" : payStatus === "pending" ? "Menunggu" : (payStatus ?? "-");
  const statusClassName = isPaid
    ? "bg-success-50 text-success-500"
    : isFailed
      ? "bg-red-50 text-red-500"
      : "bg-amber-50 text-amber-600";

  return (
    <>
      <div className="flex items-center justify-between">
        <dt className="text-ink-400">Metode Pembayaran</dt>
        <dd>
          <span className="rounded-pill bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-500">
            {payment?.payment_method?.toUpperCase() ?? "-"}
          </span>
        </dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-ink-400">Status Pembayaran</dt>
        <dd>
          <span className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${statusClassName}`}>{label}</span>
        </dd>
      </div>
    </>
  );
}
