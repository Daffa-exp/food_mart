"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Plus, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn, formatRating, formatRupiah, getProductImage } from "@/utils/format";
import { useCartStore } from "@/store/cart-store";
import { Product } from "@/types/entities";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stockQuantity > 0;

  const badge = product.isBestSeller
    ? "Best Seller"
    : product.isPromo
    ? "Promo"
    : product.isNew
    ? "Baru"
    : undefined;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setJustAdded(true);
    toast.success(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setJustAdded(false), 600);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-card border border-surface-border bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <Link href={`/menu/${product.slug}`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={getProductImage(product.images)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          {badge && (
            <span className="absolute left-2.5 top-2.5 rounded-pill bg-primary-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              {badge}
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="absolute right-2.5 top-2.5 rounded-pill bg-success-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              -{product.discountPercentage}%
            </span>
          )}
        </div>
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
          <span className="mx-1 text-ink-400">·</span>
          <span className="text-xs text-ink-400">
            {inStock ? "Stok Tersedia" : "Stok Habis"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <span className="block text-sm font-bold text-ink-900">
              {formatRupiah(product.finalPrice)}
            </span>
            {product.discountPercentage > 0 && (
              <span className="block text-[11px] text-ink-400 line-through">
                {formatRupiah(product.price)}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label={justAdded ? "Ditambahkan ke keranjang" : "Tambah ke keranjang"}
            className={cn(
              "flex shrink-0 items-center justify-center gap-1 rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-ink-400",
              "h-9 w-9 sm:h-auto sm:w-auto sm:rounded-pill sm:px-3 sm:py-2 sm:text-xs sm:font-semibold",
              justAdded && "bg-success-500 hover:bg-success-500"
            )}
          >
            <motion.span
              animate={justAdded ? { rotate: 360, scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center"
            >
              {justAdded ? <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
            </motion.span>
            <span className="hidden sm:inline">{justAdded ? "Ditambahkan" : "Keranjang"}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}