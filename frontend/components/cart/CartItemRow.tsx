"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Trash2, Minus, Plus } from "lucide-react";
import { formatRupiah, getProductImage, cn } from "@/utils/format";
import { CartLine, useCartStore } from "@/store/cart-store";

const CATEGORY_COLORS: Record<string, string> = {
  Burger: "bg-primary-500",
  Pizza: "bg-accent-500",
  Ayam: "bg-amber-500",
  Nasi: "bg-emerald-500",
  Minuman: "bg-sky-500",
  Dessert: "bg-pink-500",
  Snack: "bg-orange-500",
  Seafood: "bg-cyan-500",
};

export default function CartItemRow({ line }: { line: CartLine }) {
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 border-b border-surface-border py-5 last:border-b-0"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <Image src={getProductImage([line.imageUrl])} alt={line.name} fill className="object-cover" />
        <span
          className={cn(
            "absolute left-1 top-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold text-white",
            CATEGORY_COLORS[line.categoryLabel] ?? "bg-primary-500"
          )}
        >
          {line.categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/menu/${line.slug}`} className="text-sm font-semibold text-ink-900 hover:text-primary-500">
              {line.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink-400">{formatRupiah(line.price)} / porsi</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => toggleFavorite(line.productId)}
              aria-label="Tandai favorit"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-surface-cream hover:text-primary-500"
            >
              <Heart className={cn("h-4 w-4", line.isFavorite && "fill-primary-500 text-primary-500")} />
            </button>
            <button
              onClick={() => removeItem(line.productId)}
              aria-label="Hapus item"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-center gap-3 rounded-pill border border-surface-border px-2 py-1">
            <button
              onClick={() => decrementItem(line.productId)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-ink-700 hover:bg-surface-cream"
              aria-label="Kurangi jumlah"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-4 text-center text-sm font-semibold text-ink-900">{line.quantity}</span>
            <button
              onClick={() => incrementItem(line.productId)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-ink-700 hover:bg-surface-cream"
              aria-label="Tambah jumlah"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-ink-400">Subtotal</p>
            <p className="text-sm font-bold text-ink-900">{formatRupiah(line.price * line.quantity)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
