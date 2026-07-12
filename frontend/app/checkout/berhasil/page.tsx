import Link from "next/link";
import { CheckCircle2, ShieldCheck, Clock3, PackageCheck, Copy, MessageSquareText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import OrderStatusStepper from "@/components/checkout/OrderStatusStepper";
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
    } catch (err) {
      // Sebelumnya error aslinya "ditelan" begitu saja, jadi susah tahu
      // penyebabnya (backend mati? URL salah? order tidak ketemu?). Sekarang
      // dicetak ke terminal server Next.js supaya kelihatan.
      console.error("[checkout/berhasil] Gagal mengambil order:", err);
      fetchError = "Tidak dapat mengambil data pesanan dari server.";
    }
  }

  return (
    <>
      <Navbar />

      <div className="border-b border-surface-border bg-surface-cream">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/" },
              { label: "Checkout", href: "/checkout" },
              { label: "Pembayaran Berhasil" },
            ]}
          />
          <h1 className="mt-3 text-2xl font-extrabold text-primary-500 sm:text-3xl">
            Pembayaran Berhasil
          </h1>
          <p className="mt-1.5 text-sm text-ink-700">
            Pesanan Anda telah berhasil dibuat dan pembayaran telah kami terima.
          </p>
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
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
                <CheckCircle2 className="h-9 w-9 text-success-500" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-ink-900">Pembayaran Berhasil!</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-700">
                Terima kasih, pesanan Anda telah berhasil dibuat dan pembayaran telah
                kami terima. Kami akan segera memproses pesanan Anda.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="flex items-center gap-1.5 rounded-pill bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> Pembayaran Aman
                </span>
                <span className="flex items-center gap-1.5 rounded-pill bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-500">
                  <PackageCheck className="h-3.5 w-3.5" /> Pesanan Diproses
                </span>
                <span className="flex items-center gap-1.5 rounded-pill bg-surface-cream px-3 py-1.5 text-xs font-semibold text-ink-700">
                  <Clock3 className="h-3.5 w-3.5" /> Estimasi Cepat
                </span>
              </div>
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
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-400">Metode Pembayaran</dt>
                    <dd>
                      <span className="rounded-pill bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-500">
                        {order.payments?.[0]?.payment_method?.toUpperCase() ?? "-"}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-400">Status Pembayaran</dt>
                    <dd>
                      <span className="rounded-pill bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-500">
                        {order.payments?.[0]?.status === "settlement" ? "Berhasil" : order.payments?.[0]?.status ?? "-"}
                      </span>
                    </dd>
                  </div>
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
              <OrderStatusStepper
                orderStatus={order.status}
                isPaid={order.payments?.[0]?.status === "settlement"}
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
