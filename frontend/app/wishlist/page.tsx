"use client";

import Link from "next/link";
import Image from "next/image";
import { HeartOff, Plus, Star } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import { formatRupiah, formatRating, getProductImage } from "@/utils/format";
import { useWishlist } from "@/hooks/useAccountData";
import { useCartStore } from "@/store/cart-store";

export default function WishlistPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Wishlist" }]}
        title="Wishlist Saya"
        subtitle="Produk favorit yang kamu simpan untuk dipesan nanti"
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <RequireAuth message="Masuk untuk melihat wishlist kamu">
          <WishlistGrid />
        </RequireAuth>
      </main>

      <Footer />
    </>
  );
}

function WishlistGrid() {
  const { data: entries, isLoading, isError, remove } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-card bg-surface-cream" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="py-10 text-center text-sm text-red-500">Gagal memuat wishlist.</p>;
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-surface-border py-20 text-center">
        <HeartOff className="h-10 w-10 text-ink-400" />
        <div>
          <p className="font-medium text-ink-900">Wishlist masih kosong</p>
          <p className="text-sm text-ink-700">Simpan produk favoritmu dengan tap ikon hati</p>
        </div>
        <Link href="/menu">
          <Button>Jelajahi Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {entries.map(({ wishlistId, product }) => (
        <div key={wishlistId} className="overflow-hidden rounded-card border border-surface-border bg-white shadow-card">
          <Link href={`/menu/${product.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden">
            <Image src={getProductImage(product.images)} alt={product.name} fill className="object-cover" />
          </Link>
          <div className="p-3.5">
            <Link href={`/menu/${product.slug}`}>
              <h3 className="truncate text-sm font-semibold text-ink-900 hover:text-primary-500">
                {product.name}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
              <span className="text-xs font-medium text-ink-700">{formatRating(product.rating)}</span>
            </div>
            <p className="mt-2 text-sm font-bold text-ink-900">{formatRupiah(product.finalPrice)}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => remove(product.id)}
                className="flex flex-1 items-center justify-center rounded-pill border border-surface-border py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-surface-cream"
              >
                Hapus
              </button>
              <button
                onClick={() => {
                  addItem(product, 1);
                  toast.success(`${product.name} ditambahkan ke keranjang`);
                }}
                className="flex flex-1 items-center justify-center gap-1 rounded-pill bg-primary-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
              >
                <Plus className="h-3 w-3" /> Keranjang
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
