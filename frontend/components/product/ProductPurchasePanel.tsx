"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Minus, Plus, MessageSquareText } from "lucide-react";
import toast from "react-hot-toast";
import { formatRupiah } from "@/utils/format";
import { Product } from "@/types/entities";
import { useCartStore } from "@/store/cart-store";
import Button from "@/components/ui/Button";


export default function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const inStock = product.stockQuantity > 0;

  function handleAddToCart() {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} ditambahkan ke keranjang`);
    setQuantity(1);
  }

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <span className="text-xs font-medium text-primary-500">{product.categoryLabel}</span>
      <h1 className="mt-1 text-xl font-extrabold text-ink-900 sm:text-2xl">{product.name}</h1>

      <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-700">
        <Star className="h-4 w-4 fill-primary-500 text-primary-500" />
        <span className="font-medium">{product.rating.toFixed(1)}</span>
        <span className="text-ink-400">({product.ratingCount.toLocaleString("id-ID")} ulasan)</span>
        <span className="text-ink-400">·</span>
        <span className="text-ink-400">Terjual {product.soldCount.toLocaleString("id-ID")}+</span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-ink-900">{formatRupiah(product.finalPrice)}</span>
        {product.discountPercentage > 0 && (
          <>
            <span className="text-sm text-ink-400 line-through">{formatRupiah(product.price)}</span>
            <span className="rounded-pill bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-500">
              Hemat {product.discountPercentage}%
            </span>
          </>
        )}
        <span className="text-sm text-ink-400">/ porsi</span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-pill border border-surface-border px-2 py-1.5">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-surface-cream"
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-5 text-center text-sm font-semibold text-ink-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-surface-cream"
            aria-label="Tambah jumlah"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button onClick={handleAddToCart} disabled={!inStock} fullWidth size="lg">
          {inStock ? "Tambah ke Keranjang" : "Stok Habis"}
        </Button>
      </div>

      {inStock && product.stockQuantity <= 15 && (
        <p className="mt-2 text-xs text-primary-500">
          Sisa {product.stockQuantity} porsi hari ini — segera pesan!
        </p>
      )}

      <Link href={`/chat?type=produk&context=${encodeURIComponent(product.name)}&refId=${product.id}`} className="mt-3 block">
        <Button variant="outline" fullWidth size="md">
          <MessageSquareText className="h-4 w-4" />
          Chat Penjual
        </Button>
      </Link>
    </div>
  );
}
