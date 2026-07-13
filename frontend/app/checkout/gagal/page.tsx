import Link from "next/link";
import { XCircle, MessageSquareText, RotateCcw, ListOrdered } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { formatRupiah } from "@/utils/format";
import { orderService } from "@/services/order.service";

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  total_amount: number;
  payments: { status: string; payment_method: string | null }[];
}

const FAILURE_REASON: Record<string, string> = {
  expire: "Waktu pembayaran sudah habis (kedaluwarsa).",
  cancel: "Pembayaran dibatalkan.",
  deny: "Pembayaran ditolak oleh penyedia layanan pembayaran.",
  failure: "Terjadi kegagalan saat memproses pembayaran.",
};

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  let order: OrderDetail | null = null;

  if (order_id) {
    try {
      order = (await orderService.getOrderById(order_id)) as OrderDetail;
    } catch (err) {
      console.error("[checkout/gagal] Gagal mengambil order:", err);
    }
  }

  const paymentStatus = order?.payments?.[0]?.status;
  const reasonText =
    (paymentStatus && FAILURE_REASON[paymentStatus]) ??
    "Pembayaran belum berhasil diselesaikan. Pesanan kamu belum diproses.";

  return (
    <>
      <Navbar />

      <div className="border-b border-surface-border bg-surface-cream">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/" },
              { label: "Checkout", href: "/checkout" },
              { label: "Pembayaran Gagal" },
            ]}
          />
          <h1 className="mt-3 text-2xl font-extrabold text-red-500 sm:text-3xl">
            Pembayaran Gagal
          </h1>
          <p className="mt-1.5 text-sm text-ink-700">{reasonText}</p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-card border border-surface-border bg-white p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-9 w-9 text-red-500" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-ink-900">
            Pembayaran Tidak Berhasil
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-700">
            {reasonText} Jangan khawatir, belum ada dana yang terpotong untuk
            pesanan ini. Kamu bisa coba lagi kapan saja.
          </p>

          {order && (
            <div className="mx-auto mt-5 max-w-xs rounded-input border border-surface-border bg-surface-cream p-4 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-400">Nomor Pesanan</span>
                <span className="font-semibold text-ink-900">#{order.order_number}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-ink-400">Total</span>
                <span className="font-semibold text-ink-900">{formatRupiah(order.total_amount)}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/checkout">
              <Button>
                <RotateCcw className="h-4 w-4" />
                Coba Bayar Lagi
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline">
                <ListOrdered className="h-4 w-4" />
                Lihat Pesanan Saya
              </Button>
            </Link>
            <Link href="/chat?type=pesanan">
              <Button variant="outline">
                <MessageSquareText className="h-4 w-4" />
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
