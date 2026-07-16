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
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import OrderStatusLive from "@/components/checkout/OrderStatusLive";
import PaymentInfoLive from "@/components/checkout/PaymentInfoLive";
import Button from "@/components/ui/Button";
import { formatRupiah } from "@/utils/format";
import { orderService } from "@/services/order.service";

interface OrderDetail {
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
    breadcrumbLabel: "Menunggu Pembayaran",
    pageTitle: "Menunggu Pembayaran",
    pageSubtitle: "Pesanan sudah dibuat, tinggal selesaikan pembayarannya.",
    icon: Clock3,
    iconWrapClass: "bg-amber-50",
    iconClass: "text-amber-500",
    cardTitle: "Menunggu Pembayaran",
    cardMessage:
      "Pesanan kamu sudah kami catat. Segera selesaikan pembayaran sebelum waktu bayar habis, supaya pesanan bisa langsung kami proses.",
    badges: [{ icon: Clock3, label: "Menunggu Konfirmasi Bank/E-Wallet", className: "bg-amber-50 text-amber-600" }],
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

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  let order: OrderDetail | null = null;
  let fetchError: string | null = null;

  if (order_id) {
    try {
      order = (await orderService.getOrderById(order_id)) as OrderDetail;
    } catch {
      fetchError = "Tidak dapat mengambil data pesanan dari server.";
    }
  }

  const statusView = order ? getStatusView(order.status) : STATUS_VIEW.success;

  return (
    <>
      <Navbar />

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
        {!order_id || fetchError || !order ? (
          <div className="rounded-card border border-dashed border-surface-border bg-white p-10 text-center">
            <p className="font-medium text-ink-900">
              {!order_id ? "Tidak ada order_id pada URL" : fetchError}
            </p>
            <p className="mt-1.5 text-sm text-ink-700">
              Pastikan backend berjalan dan proses checkout berhasil membuat order
              sebelum mengarahkan ke halaman ini.
            </p>
            <Link href="/menu" className="mt-4 inline-block">
              <Button variant="outline">Kembali ke Menu</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-card border border-surface-border bg-white p-8 text-center">
              <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${statusView.iconWrapClass}`}>
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
                      #{order.order_number} <Copy className="h-3 w-3 text-ink-400" />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-400">Tanggal Pemesanan</dt>
                    <dd className="font-medium text-ink-900">
                      {new Date(order.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </dd>
                  </div>
                  <PaymentInfoLive
                    orderId={order.id}
                    initialStatus={order.status}
                    initialIsPaid={order.payments?.[0]?.status === "settlement"}
                    initialPaymentMethod={order.payments?.[0]?.payment_method ?? null}
                    initialPaymentStatus={order.payments?.[0]?.status ?? null}
                  />
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-400">Estimasi Pengiriman</dt>
                    <dd className="font-medium text-ink-900">
                      {DELIVERY_ESTIMATE[order.delivery_method] ?? "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-surface-border pt-2.5">
                    <dt className="font-semibold text-ink-900">Total Pembayaran</dt>
                    <dd className="text-lg font-extrabold text-primary-500">
                      {formatRupiah(order.total_amount)}
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
                    <dd className="font-semibold text-ink-900">{order.recipient_name}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-400">Nomor Telepon</dt>
                    <dd className="font-medium text-ink-900">{order.recipient_phone}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-400">Alamat Lengkap</dt>
                    <dd className="font-medium text-ink-900">{order.full_address}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6">
              <OrderStatusLive
                orderId={order.id}
                initialStatus={order.status}
                initialIsPaid={order.payments?.[0]?.status === "settlement"}
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/orders">
                <Button variant="outline">Lihat Status Pesanan</Button>
              </Link>
              <Link href={`/chat?type=pesanan&context=${encodeURIComponent(order.order_number)}&refId=${order.id}`}>
                <Button variant="outline">
                  <MessageSquareText className="h-4 w-4" />
                  Chat Penjual
                </Button>
              </Link>
              <Link href="/menu">
                <Button>Pesan Lagi</Button>
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
