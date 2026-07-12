"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import CategoryFilterBar from "@/components/product/CategoryFilterBar";
import SortFilterBar, { SortOption } from "@/components/product/SortFilterBar";
import ProductCard from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useProducts";

export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuPageContent />
    </Suspense>
  );
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("kategori") ?? "semua");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("terlaris");
  const [quickFilter, setQuickFilter] = useState<string | null>(null);


  const queryParams = useMemo(
    () => ({
      category: category !== "semua" ? category : undefined,
      search: search.trim() || undefined,
      sort,
      promo: quickFilter === "Promo" || undefined,
      bestSeller: quickFilter === "Terlaris" || undefined,
      isNew: quickFilter === "Terbaru" || undefined,
      pageSize: 40,
    }),
    [category, search, sort, quickFilter]
  );

  const { data, isLoading, isError } = useProducts(queryParams);

  function handleQuickFilterChange(filter: string | null) {
    setQuickFilter(filter);
    if (filter === "Harga") setSort("harga_terendah");
    if (filter === "Rating") setSort("rating");
  }

  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Menu" }]}
        title="Menu Makanan"
        subtitle="Temukan makanan favoritmu dari ratusan pilihan terbaik"
        action={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Cari makanan favorit..."
              className="w-full rounded-pill border border-surface-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CategoryFilterBar active={category} onChange={setCategory} />

        <div className="mt-5">
          <SortFilterBar
            sort={sort}
            onSortChange={setSort}
            activeQuickFilter={quickFilter}
            onQuickFilterChange={handleQuickFilterChange}
          />
        </div>

        {isLoading && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-card bg-surface-cream" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <p className="font-medium text-ink-900">Gagal memuat produk</p>
            <p className="text-sm text-ink-700">Pastikan backend berjalan dan coba lagi</p>
          </div>
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
            <p className="font-medium text-ink-900">Produk tidak ditemukan</p>
            <p className="text-sm text-ink-700">Coba kata kunci atau filter lain</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
