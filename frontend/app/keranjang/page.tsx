"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Plus, ShoppingCart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import CartItemRow from "@/components/cart/CartItemRow";
import RecommendedProducts from "@/components/cart/RecommendedProducts";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/utils/format";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());

  const shippingFee = subtotal >= 50000 || lines.length === 0 ? 0 : 10000;
  const total = subtotal + shippingFee;

  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Keranjang" }]}
        title="Keranjang Belanja"
        subtitle="Periksa pesananmu sebelum melanjutkan pembayaran"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-surface-border py-20 text-center">
            <ShoppingCart className="h-10 w-10 text-ink-400" />
            <div>
              <p className="font-medium text-ink-900">Keranjangmu masih kosong</p>
              <p className="text-sm text-ink-700">Yuk mulai pesan makanan favoritmu</p>
            </div>
            <Link href="/menu">
              <Button>Lihat Menu</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-card border border-surface-border bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  <h2 className="text-sm font-bold text-ink-900">Item Keranjang</h2>
                  <span className="rounded-pill bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-500">
                    {totalItems} item
                  </span>
                </div>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-500 transition-colors hover:text-red-600"
                >
                  Hapus Semua
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {lines.map((line) => (
                  <CartItemRow key={line.productId} line={line} />
                ))}
              </AnimatePresence>
            </div>

            <Link
              href="/menu"
              className="mt-4 flex items-center justify-between rounded-card border border-dashed border-primary-300 bg-primary-50/50 px-5 py-4 transition-colors hover:bg-primary-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white">
                  <Plus className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Tambah Item Lagi</p>
                  <p className="text-xs text-ink-700">Temukan makanan favoritmu di menu kami</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Lihat Menu</Button>
            </Link>

            <RecommendedProducts />

            {/* Ringkasan Belanja */}
            <div className="mt-6 rounded-card border border-surface-border bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">Ringkasan Belanja</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-700">
                  <span>Subtotal ({totalItems} item)</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-700">
                  <span>Ongkos Kirim</span>
                  <span>{shippingFee === 0 ? "Gratis" : formatRupiah(shippingFee)}</span>
                </div>
                <div className="flex justify-between border-t border-surface-border pt-2 text-base font-bold text-ink-900">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button fullWidth size="lg" className="mt-4">
                  Lanjutkan ke Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
