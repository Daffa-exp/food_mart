import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import PaymentResultView, { OrderDetail } from "@/components/checkout/PaymentResultView";
import { orderService } from "@/services/order.service";

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

  return (
    <>
      <Navbar />

      {!order_id || fetchError || !order ? (
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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
        </main>
      ) : (
        <PaymentResultView orderId={order_id} initialOrder={order} />
      )}

      <Footer />
    </>
  );
}
