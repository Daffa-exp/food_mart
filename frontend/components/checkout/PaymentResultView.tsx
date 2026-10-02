"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Clock3,
  PackageCheck,
  Copy,
  MessageSquareText,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import OrderStatusStepper from "@/components/checkout/OrderStatusStepper";
import PayNowButton from "@/components/orders/PayNowButton";
import Button from "@/components/ui/Button";
import { formatRupiah } from "@/utils/format";
import { orderService } from "@/services/order.service";

export interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  recipient_name: string;
  recipient_phone: string;
  full_address: string;
  total_amount: number;
  delivery_method: string;
  payments: { status: string; payment_method: string | null }[];
}

const DELIVERY_ESTIMATE: Record<string, string> = {
  instant: "20–30 Menit",
  same_day: "1–3 Jam",
  regular: "4 Jam",
};

const STATUS_VIEW = {
  cancelled: {
    breadcrumbLabel: "Pesanan Dibatalkan",
    pageTitle: "Pesanan Dibatalkan",
    pageSubtitle: "Pembayaran gagal, ditolak, atau waktu bayar sudah habis.",
    icon: XCircle,
    iconWrapClass: "bg-red-50",
    iconClass: "text-red-500",
    cardTitle: "Pesanan Dibatalkan",
    cardMessage:
      "Pembayaran untuk pesanan ini tidak berhasil diselesaikan, sehingga pesanan otomatis dibatalkan. Kamu bisa membuat pesanan baru kapan saja.",
    badges: [] as { icon: typeof ShieldCheck; label: string; className: string }[],
  },
  refunded: {
    breadcrumbLabel: "Dana Dikembalikan",
    pageTitle: "Dana Dikembalikan",
    pageSubtitle: "Pembayaran untuk pesanan ini telah dikembalikan.",
    icon: RotateCcw,
    iconWrapClass: "bg-primary-50",
    iconClass: "text-primary-500",
    cardTitle: "Dana Dikembalikan",
    cardMessage: "Dana pembayaran untuk pesanan ini sudah kami proses pengembaliannya.",
    badges: [],
  },
  pending: {
    breadcrumbLabel: "Memverifikasi Pembayaran",
    pageTitle: "Memverifikasi Pembayaran",
    pageSubtitle: "Sistem sedang memeriksa dan mengonfirmasi pembayaran pesanan Anda.",
    icon: Clock3,
    iconWrapClass: "bg-amber-50",
    iconClass: "text-amber-500 animate-pulse",
    cardTitle: "Sedang Memverifikasi Pembayaran",
    cardMessage:
      "Jika Anda sudah menyelesaikan pembayaran di bank/e-wallet, status pesanan akan otomatis terkonfirmasi dalam beberapa detik. Anda tidak perlu membayar ulang.",
    badges: [
      { icon: Clock3, label: "Mengecek Pembayaran Otomatis...", className: "bg-amber-50 text-amber-600 animate-pulse" },
      { icon: ShieldCheck, label: "Verifikasi Aman", className: "bg-primary-50 text-primary-500" },
    ],
  },
  success: {
    breadcrumbLabel: "Pembayaran Berhasil",
    pageTitle: "Pembayaran Berhasil",
    pageSubtitle: "Pesanan Anda telah berhasil dibuat dan pembayaran telah kami terima.",
    icon: CheckCircle2,
    iconWrapClass: "bg-success-50",
    iconClass: "text-success-500",
    cardTitle: "Pembayaran Berhasil!",
    cardMessage:
      "Terima kasih, pesanan Anda telah berhasil dibuat dan pembayaran telah kami terima. Kami akan segera memproses pesanan Anda.",
    badges: [
      { icon: ShieldCheck, label: "Pembayaran Aman", className: "bg-success-50 text-success-500" },
      { icon: PackageCheck, label: "Pesanan Diproses", className: "bg-primary-50 text-primary-500" },
      { icon: Clock3, label: "Estimasi Cepat", className: "bg-surface-cream text-ink-700" },
    ],
  },
} as const;

function getStatusView(status: string) {
  if (status === "cancelled") return STATUS_VIEW.cancelled;
  if (status === "refunded") return STATUS_VIEW.refunded;
  if (status === "pending") return STATUS_VIEW.pending;
  return STATUS_VIEW.success; // confirmed, processing, shipped, delivered
}

export default function PaymentResultView({
  orderId,
  initialOrder,
}: {
  orderId: string;
  initialOrder: OrderDetail;
}) {
  const { data: order } = useQuery({
    queryKey: ["order-status-live", orderId],
    queryFn: () => orderService.getOrderById(orderId) as Promise<OrderDetail>,
    initialData: initialOrder,
    refetchInterval: (query) => {
      const current = query.state.data;
      const isPending = current?.status === "pending" || current?.payments?.[0]?.status === "pending";
      return isPending ? 1_500 : 15_000;
    },
  });

  const activeOrder = order ?? initialOrder;
  const statusView = getStatusView(activeOrder.status);
  const payment = activeOrder.payments?.[0];
  const payStatus = payment?.status;
  const isPaid = payStatus === "settlement" || activeOrder.status !== "pending";
  const isFailed = payStatus === "deny" || payStatus === "cancel" || payStatus === "expire" || activeOrder.status === "cancelled";
  const payLabel = isPaid
    ? "Berhasil"
    : isFailed
      ? "Gagal"
      : payStatus === "pending"
        ? "Menunggu"
        : (payStatus ?? "-");
  const payStatusClassName = isPaid
    ? "bg-success-50 text-success-500"
    : isFailed
      ? "bg-red-50 text-red-500"
      : "bg-amber-50 text-amber-600";

  function copyOrderNumber() {
    navigator.clipboard.writeText(activeOrder.order_number);
    toast.success("Nomor pesanan disalin");
  }

  return (
    <>
      <div className="border-b border-surface-border bg-surface-cream">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/" },
              { label: "Checkout", href: "/checkout" },
              { label: statusView.breadcrumbLabel },
            ]}
          />
          <h1 className="mt-3 text-2xl font-extrabold text-primary-500 sm:text-3xl">
            {statusView.pageTitle}
          </h1>
          <p className="mt-1.5 text-sm text-ink-700">{statusView.pageSubtitle}</p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-card border border-surface-border bg-white p-8 text-center transition-all duration-300">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${statusView.iconWrapClass}`}
          >
            <statusView.icon className={`h-9 w-9 ${statusView.iconClass}`} />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-ink-900">{statusView.cardTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-700">{statusView.cardMessage}</p>
          {statusView.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {statusView.badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold ${badge.className}`}
                >
                  <badge.icon className="h-3.5 w-3.5" /> {badge.label}
                </span>
              ))}
            </div>
          )}
          {activeOrder.status === "pending" && (
            <div className="mt-6 rounded-card border border-amber-200 bg-amber-50/60 p-4 text-center">
              <p className="text-xs font-medium text-amber-900">
                Belum menyelesaikan pembayaran atau jendela pembayaran tertutup?
              </p>
              <div className="mt-2.5 flex justify-center">
                <PayNowButton
                  orderId={activeOrder.id}
                  variant="outline"
                  size="sm"
                  label="Lanjutkan Pembayaran"
                  className="bg-white border-amber-400 text-amber-700 hover:bg-amber-100"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-surface-border bg-white p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">
              Informasi Pesanan
            </h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-400">Nomor Pesanan</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-ink-900">
                  #{activeOrder.order_number}{" "}
                  <button
                    type="button"
                    onClick={copyOrderNumber}
                    className="text-ink-400 hover:text-ink-700 transition-colors"
                    title="Salin nomor pesanan"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-400">Tanggal Pemesanan</dt>
                <dd className="font-medium text-ink-900">
                  {new Date(activeOrder.created_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
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
                  <span
                    className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${payStatusClassName}`}
                  >
                    {payLabel}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-400">Estimasi Pengiriman</dt>
                <dd className="font-medium text-ink-900">
                  {DELIVERY_ESTIMATE[activeOrder.delivery_method] ?? "-"}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-surface-border pt-2.5">
                <dt className="font-semibold text-ink-900">Total Pembayaran</dt>
                <dd className="text-lg font-extrabold text-primary-500">
                  {formatRupiah(activeOrder.total_amount)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-card border border-surface-border bg-white p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">
              Pesanan Akan Dikirim Ke
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-ink-400">Nama Penerima</dt>
                <dd className="font-semibold text-ink-900">{activeOrder.recipient_name}</dd>
              </div>
              <div>
                <dt className="text-ink-400">Nomor Telepon</dt>
                <dd className="font-medium text-ink-900">{activeOrder.recipient_phone}</dd>
              </div>
              <div>
                <dt className="text-ink-400">Alamat Lengkap</dt>
                <dd className="font-medium text-ink-900">{activeOrder.full_address}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6">
          <OrderStatusStepper
            orderStatus={activeOrder.status}
            isPaid={isPaid}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/orders">
            <Button variant="outline">Lihat Status Pesanan</Button>
          </Link>
          <Link
            href={`/chat?type=pesanan&context=${encodeURIComponent(activeOrder.order_number)}&refId=${activeOrder.id}`}
          >
            <Button variant="outline">
              <MessageSquareText className="h-4 w-4" />
              Chat Penjual
            </Button>
          </Link>
          <Link href="/menu">
            <Button>Pesan Lagi</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
