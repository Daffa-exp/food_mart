"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatRupiah } from "@/utils/format";
import { useAdminOrders } from "@/hooks/useAdmin";
import { apiClient } from "@/services/admin-api-client";

async function downloadReport(kind: "excel" | "pdf", dateFrom: string, dateTo: string) {
  const response = await apiClient.get(`/admin/reports/export/${kind}`, {
    params: { dateFrom: `${dateFrom}T00:00:00`, dateTo: `${dateTo}T23:59:59` },
    responseType: "blob",
  });

  const contentType = kind === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf";
  const blob = new Blob([response.data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-penjualan-${dateFrom}_${dateTo}.${kind === "excel" ? "xlsx" : "pdf"}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const { data, isLoading, isError } = useAdminOrders({
    dateFrom: `${dateFrom}T00:00:00`,
    dateTo: `${dateTo}T23:59:59`,
    pageSize: 500,
  });

  const settledOrders = (data?.data ?? []).filter((o) => o.paymentStatus === "settlement");
  const totalRevenue = settledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  async function handleExport(kind: "excel" | "pdf") {
    setExporting(kind);
    try {
      await downloadReport(kind, dateFrom, dateTo);
    } catch {
      alert(`Gagal mengekspor laporan ${kind === "excel" ? "Excel" : "PDF"}. Coba lagi.`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Reports</h1>
          <p className="text-sm text-ink-700">Rekap penjualan berdasarkan rentang tanggal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")} disabled={exporting !== null}>
            <Download className="h-4 w-4" /> {exporting === "excel" ? "Menyiapkan..." : "Export Excel"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={exporting !== null}>
            <FileText className="h-4 w-4" /> {exporting === "pdf" ? "Menyiapkan..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-card border border-surface-border bg-white p-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-900">Dari Tanggal</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-input border border-surface-border px-3 py-2 text-sm outline-none focus:border-primary-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-900">Sampai Tanggal</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-input border border-surface-border px-3 py-2 text-sm outline-none focus:border-primary-400" />
        </div>
      </div>

      {isLoading && <div className="h-40 animate-pulse rounded-card bg-white" />}
      {isError && <p className="text-sm text-red-500">Gagal memuat laporan.</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-card border border-surface-border bg-white p-5">
              <p className="text-xs text-ink-400">Total Revenue (Berhasil)</p>
              <p className="mt-1 text-xl font-extrabold text-success-500">{formatRupiah(totalRevenue)}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-5">
              <p className="text-xs text-ink-400">Order Berhasil</p>
              <p className="mt-1 text-xl font-extrabold text-ink-900">{settledOrders.length}</p>
            </div>
            <div className="rounded-card border border-surface-border bg-white p-5">
              <p className="text-xs text-ink-400">Total Order (Semua Status)</p>
              <p className="mt-1 text-xl font-extrabold text-ink-900">{data.total}</p>
            </div>
          </div>

          <div className="rounded-card border border-surface-border bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((o) => (
                  <tr key={o.id} className="border-b border-surface-border">
                    <td className="px-4 py-2.5 font-medium text-primary-500">#{o.orderNumber}</td>
                    <td className="px-4 py-2.5 text-ink-700">{o.customerName}</td>
                    <td className="px-4 py-2.5 text-ink-900">{formatRupiah(o.totalAmount)}</td>
                    <td className="px-4 py-2.5 text-ink-700">{o.status}</td>
                    <td className="px-4 py-2.5 text-ink-400">{new Date(o.createdAt).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
                {data.data.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-700">Tidak ada transaksi di rentang ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
