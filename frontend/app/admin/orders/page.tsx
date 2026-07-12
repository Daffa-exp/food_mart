"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import { cn, formatRupiah } from "@/utils/format";
import { useAdminOrders } from "@/hooks/useAdmin";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Menunggu Pembayaran" },
  { value: "confirmed", label: "Diterima" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "delivered", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "refunded", label: "Refund" },
];

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-surface-cream text-ink-700",
  confirmed: "bg-primary-50 text-primary-500",
  processing: "bg-primary-50 text-primary-500",
  shipped: "bg-primary-50 text-primary-500",
  delivered: "bg-success-50 text-success-500",
  cancelled: "bg-red-50 text-red-500",
  refunded: "bg-red-50 text-red-500",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminOrders({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Orders</h1>
        <p className="text-sm text-ink-700">Kelola seluruh pesanan pelanggan</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nomor order..."
              className="w-full rounded-pill border border-surface-border bg-surface-cream/60 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-pill border border-surface-border bg-white px-4 py-2 text-sm outline-none focus:border-primary-400"
          >
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-700">Memuat...</td></tr>
              )}
              {isError && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-red-500">Gagal memuat order.</td></tr>
              )}
              {data?.data.map((o) => (
                <tr key={o.id} className="border-b border-surface-border hover:bg-surface-cream/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-semibold text-primary-500 hover:underline">
                      #{o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{o.customerName}</p>
                    <p className="text-xs text-ink-400">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{o.itemCount} item</td>
                  <td className="px-4 py-3 font-medium text-ink-900">{formatRupiah(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-pill px-2.5 py-1 text-xs font-semibold", STATUS_CLASS[o.status])}>
                      {STATUS_OPTIONS.find((s) => s.value === o.status)?.label ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-400">
                    {new Date(o.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </td>
                </tr>
              ))}
              {data && data.data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-700">Belum ada order.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {data && <AdminPagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </div>
    </div>
  );
}
