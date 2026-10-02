"use client";

import { useQuery } from "@tanstack/react-query";
import OrderStatusStepper from "@/components/checkout/OrderStatusStepper";
import { orderService } from "@/services/order.service";

interface OrderLike {
  status: string;
  payments?: { status: string }[];
}

// PENTING: halaman /checkout/berhasil adalah Server Component yang hanya
// mengambil data order SATU KALI saat request pertama. Kalau admin mengubah
// status paket setelah itu, customer yang masih membuka halaman/link yang
// sama TIDAK PERNAH melihat perubahan karena tidak ada mekanisme refresh di
// server component. Komponen client ini mengambil alih tampilan status
// pengiriman dan polling ke API setiap 15 detik, dengan data awal dari
// server sebagai fallback pertama supaya tidak ada flicker loading.
export default function OrderStatusLive({
  orderId,
  initialStatus,
  initialIsPaid,
}: {
  orderId: string;
  initialStatus: string;
  initialIsPaid: boolean;
}) {
  const { data } = useQuery({
    queryKey: ["order-status-live", orderId],
    queryFn: () => orderService.getOrderById(orderId) as Promise<OrderLike>,
    // Poll lebih cepat (2 detik) saat status masih pending agar status pembayaran
    // langsung ter-update begitu webhook Midtrans masuk, lalu melambat ke 15 detik
    // setelah status confirmed/cancelled supaya tidak membebani server.
    refetchInterval: (query) => {
      const payStatus = query.state.data?.payments?.[0]?.status;
      return payStatus === "pending" || payStatus === undefined ? 2_000 : 15_000;
    },
    initialData: { status: initialStatus, payments: [{ status: initialIsPaid ? "settlement" : "pending" }] },
  });

  return (
    <OrderStatusStepper
      orderStatus={data?.status ?? initialStatus}
      isPaid={data?.payments?.[0]?.status === "settlement"}
    />
  );
}
