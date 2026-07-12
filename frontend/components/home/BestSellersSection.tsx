"use client";

import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { useProducts } from "@/hooks/useProducts";

export default function BestSellersSection() {
  const { data, isLoading, isError } = useProducts({ bestSeller: true, pageSize: 8 });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        title="Produk Terlaris"
        subtitle="Menu paling dicari oleh ribuan pelanggan setia kami"
        align="left"
        action={
          <Link href="/menu">
            <Button variant="outline" size="sm">Lihat Semua</Button>
          </Link>
        }
      />

      {isLoading && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-card bg-surface-cream" />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-6 text-sm text-red-500">
          Gagal memuat produk terlaris. Pastikan backend berjalan.
        </p>
      )}

      {data && data.data.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
