"use client";

import { useState } from "react";
import AdminPagination from "@/components/admin/AdminPagination";
import { cn, formatRupiah } from "@/utils/format";
import { useAdminPayments } from "@/hooks/useAdmin";

const PAGE_SIZE = 15;

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-surface-cream text-ink-700",
  settlement: "bg-success-50 text-success-500",
  expire: "bg-red-50 text-red-500",
  cancel: "bg-red-50 text-red-500",
  failure: "bg-red-50 text-red-500",
  challenge: "bg-amber-50 text-amber-600",
  refund: "bg-amber-50 text-amber-600",
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "settlement", label: "Berhasil" },
  { value: "expire", label: "Kadaluarsa" },
  { value: "cancel", label: "Dibatalkan" },
  { value: "failure", label: "Gagal" },
  { value: "challenge", label: "Challenge" },
  { value: "refund", label: "Refund" },
];

export default function AdminPaymentsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminPayments({ status: status || undefined, page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Payment History</h1>
        <p className="text-sm text-ink-700">Riwayat seluruh transaksi pembayaran Midtrans</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white">
        <div className="border-b border-surface-border p-4">
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
              <th className="px-4 py-3">Penerima</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Jumlah</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-700">Memuat...</td></tr>}
            {isError && <tr><td colSpan={6} className="px-4 py-8 text-center text-red-500">Gagal memuat riwayat pembayaran.</td></tr>}
            {data?.data.map((p) => (
              <tr key={p.id} className="border-b border-surface-border hover:bg-surface-cream/40">
                <td className="px-4 py-3 font-semibold text-primary-500">#{p.orderNumber}</td>
                <td className="px-4 py-3 text-ink-700">{p.recipientName}</td>
                <td className="px-4 py-3 text-ink-700">{p.paymentMethod?.toUpperCase() ?? "-"}</td>
                <td className="px-4 py-3 font-medium text-ink-900">{formatRupiah(p.grossAmount)}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-pill px-2.5 py-1 text-xs font-semibold", STATUS_CLASS[p.status])}>
                    {STATUS_OPTIONS.find((s) => s.value === p.status)?.label ?? p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-400">{new Date(p.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</td>
              </tr>
            ))}
            {data?.data.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-700">Belum ada transaksi.</td></tr>}
          </tbody>
        </table>
        </div>

        {data && <AdminPagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </div>
    </div>
  );
}
