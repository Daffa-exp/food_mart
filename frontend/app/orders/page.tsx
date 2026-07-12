"use client";

import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import RequireAuth from "@/components/auth/RequireAuth";
import OrderHistoryCard from "@/components/orders/OrderHistoryCard";
import Button from "@/components/ui/Button";
import { useMyOrders } from "@/hooks/useAccountData";

export default function OrdersPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Riwayat Pesanan" }]}
        title="Riwayat Pesanan"
        subtitle="Pantau semua transaksi yang pernah kamu lakukan"
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <RequireAuth message="Masuk untuk melihat riwayat pesananmu">
          <OrdersList />
        </RequireAuth>
      </main>

      <Footer />
    </>
  );
}

function OrdersList() {
  const { data: orders, isLoading, isError } = useMyOrders();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-card bg-surface-cream" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="py-10 text-center text-sm text-red-500">Gagal memuat riwayat pesanan.</p>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-surface-border py-20 text-center">
        <PackageSearch className="h-10 w-10 text-ink-400" />
        <div>
          <p className="font-medium text-ink-900">Belum ada pesanan</p>
          <p className="text-sm text-ink-700">Yuk mulai pesan makanan favoritmu</p>
        </div>
        <Link href="/menu">
          <Button>Lihat Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderHistoryCard key={order.id} order={order} />
      ))}
    </div>
  );
}
