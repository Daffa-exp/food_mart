"use client";

import { use, useState } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { formatRupiah } from "@/utils/format";
import { useAdminOrder, useAdminOrderStatusMutation } from "@/hooks/useAdmin";
import { OrderStatus } from "@/types/entities";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "confirmed", label: "Diterima" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "delivered", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "refunded", label: "Refund" },
];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useAdminOrder(id);
  const statusMutation = useAdminOrderStatusMutation();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | "">("");

  if (isLoading) return <div className="h-96 animate-pulse rounded-card bg-white" />;
  if (isError || !order) return <p className="text-sm text-red-500">Gagal memuat detail order.</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <Breadcrumb items={[{ label: "Orders", href: "/admin/orders" }, { label: `#${order.order_number}` }]} />
      <h1 className="text-xl font-extrabold text-ink-900">Order #{order.order_number}</h1>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">Ubah Status</h3>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={pendingStatus || order.status}
            onChange={(e) => setPendingStatus(e.target.value as OrderStatus)}
            className="rounded-input border border-surface-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-400"
          >
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Button
            size="sm"
            disabled={!pendingStatus || pendingStatus === order.status || statusMutation.isPending}
            onClick={() => pendingStatus && statusMutation.mutate({ id, status: pendingStatus })}
          >
            {statusMutation.isPending ? "Menyimpan..." : "Perbarui Status"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-surface-border bg-white p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">Info Penerima</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-ink-400">Nama</dt><dd className="font-medium text-ink-900">{order.recipient_name}</dd></div>
            <div><dt className="text-ink-400">Telepon</dt><dd className="font-medium text-ink-900">{order.recipient_phone}</dd></div>
            <div><dt className="text-ink-400">Alamat</dt><dd className="font-medium text-ink-900">{order.full_address}</dd></div>
          </dl>
        </div>
        <div className="rounded-card border border-surface-border bg-white p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">Pembayaran</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-ink-400">Status</dt><dd className="font-medium text-ink-900">{order.payments?.[0]?.status ?? "-"}</dd></div>
            <div><dt className="text-ink-400">Metode</dt><dd className="font-medium text-ink-900">{order.payments?.[0]?.payment_method ?? "-"}</dd></div>
            <div><dt className="text-ink-400">Total</dt><dd className="font-bold text-primary-500">{formatRupiah(order.total_amount)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">Item Pesanan</h3>
        <ul className="divide-y divide-surface-border">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between py-2.5 text-sm">
              <span className="text-ink-700">{item.product_name} x{item.quantity}</span>
              <span className="font-medium text-ink-900">{formatRupiah(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-surface-border pt-3 text-sm">
          <div className="flex justify-between text-ink-700"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
          <div className="flex justify-between text-ink-700"><span>Ongkir</span><span>{formatRupiah(order.shipping_fee)}</span></div>
          <div className="flex justify-between text-ink-700"><span>Diskon</span><span>-{formatRupiah(order.discount_amount)}</span></div>
          <div className="flex justify-between text-ink-700"><span>Biaya Layanan</span><span>{formatRupiah(order.service_fee)}</span></div>
          <div className="flex justify-between border-t border-surface-border pt-2 text-base font-bold text-ink-900">
            <span>Total</span><span>{formatRupiah(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
