"use client";

import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Wallet, ShoppingBag, TrendingUp, Clock, ChevronRight } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { cn, formatRupiah } from "@/utils/format";
import { useDashboardSummary } from "@/hooks/useAdmin";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  confirmed: "Diterima",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Refund",
};

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-card bg-white" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-500">Gagal memuat data dashboard. Pastikan backend berjalan.</p>;
  }

  const pendingCount = data.orderStatusCounts.pending ?? 0;
  const activeCount =
    (data.orderStatusCounts.confirmed ?? 0) +
    (data.orderStatusCounts.processing ?? 0) +
    (data.orderStatusCounts.shipped ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-700">Ringkasan performa toko 30 hari terakhir</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Revenue (30 hari)" value={data.revenue30Days} format={formatRupiah} accent="success" />
        <StatCard icon={ShoppingBag} label="Order Berhasil (30 hari)" value={data.orders30Days} accent="primary" />
        <StatCard icon={Clock} label="Menunggu Pembayaran" value={pendingCount} accent="amber" />
        <StatCard icon={TrendingUp} label="Order Aktif Diproses" value={activeCount} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-card border border-surface-border bg-white p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-ink-900">Tren Revenue (14 Hari Terakhir)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.dailyRevenueChart}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5821F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F5821F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1E4D8" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v / 1000}k`}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip formatter={(value: number) => formatRupiah(value)} labelFormatter={(d) => new Date(d).toLocaleDateString("id-ID", { dateStyle: "medium" })} />
              <Area type="monotone" dataKey="total" stroke="#F5821F" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="rounded-card border border-surface-border bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-ink-900">Status Order</h3>
          <div className="space-y-3">
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{label}</span>
                <span className="font-semibold text-ink-900">{data.orderStatusCounts[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best Sellers */}
        <div className="rounded-card border border-surface-border bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-ink-900">Produk Terlaris</h3>
          <div className="space-y-3">
            {data.bestSellers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-500">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.soldCount} terjual</p>
                </div>
                <span className="text-sm font-semibold text-ink-900">{formatRupiah(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-card border border-surface-border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-900">Order Terbaru</h3>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-primary-500">
              Lihat Semua <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between rounded-input px-2 py-1.5 text-sm transition-colors hover:bg-surface-cream"
              >
                <div>
                  <p className="font-medium text-ink-900">#{o.orderNumber}</p>
                  <p className="text-xs text-ink-400">{o.recipientName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink-900">{formatRupiah(o.totalAmount)}</p>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      o.paymentStatus === "settlement" ? "text-success-500" : "text-amber-600"
                    )}
                  >
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
