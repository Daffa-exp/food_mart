"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX, Search as SearchIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/product/ProductCard";
import SortFilterBar, { SortOption } from "@/components/product/SortFilterBar";
import { useProducts } from "@/hooks/useProducts";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [sort, setSort] = useState<SortOption>("terlaris");
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const { data, isLoading, isError } = useProducts({
    search: query || undefined,
    sort,
    promo: quickFilter === "Promo" || undefined,
    bestSeller: quickFilter === "Terlaris" || undefined,
    isNew: quickFilter === "Terbaru" || undefined,
    pageSize: 40,
  });

  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Pencarian" }]}
        title={query ? `Hasil untuk "${query}"` : "Pencarian"}
        subtitle={
          data ? `Ditemukan ${data.total} produk` : "Cari makanan favoritmu dari ratusan pilihan"
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!query ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <SearchIcon className="h-10 w-10 text-ink-400" />
            <p className="font-medium text-ink-900">Ketik sesuatu di kolom pencarian</p>
            <p className="text-sm text-ink-700">Gunakan kolom pencarian di navbar untuk mulai mencari</p>
          </div>
        ) : (
          <>
            <SortFilterBar
              sort={sort}
              onSortChange={setSort}
              activeQuickFilter={quickFilter}
              onQuickFilterChange={setQuickFilter}
            />

            {isLoading && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-card bg-surface-cream" />
                ))}
              </div>
            )}

            {isError && (
              <p className="mt-10 text-center text-sm text-red-500">Gagal memuat hasil pencarian.</p>
            )}

            {data && data.data.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {data && data.data.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <SearchX className="h-10 w-10 text-ink-400" />
                <p className="font-medium text-ink-900">Tidak ada hasil untuk &quot;{query}&quot;</p>
                <p className="text-sm text-ink-700">Coba kata kunci lain</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
