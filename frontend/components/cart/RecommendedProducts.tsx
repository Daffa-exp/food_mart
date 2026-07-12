"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { formatRupiah, getProductImage } from "@/utils/format";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cart-store";

export default function RecommendedProducts() {
  const cartProductIds = useCartStore((s) => s.lines.map((l) => l.productId));
  const addItem = useCartStore((s) => s.addItem);
  const { data, isLoading } = useProducts({ sort: "terlaris", pageSize: 8 });
  const addToCart = addItem;

  const recommendations = (data?.data ?? [])
    .filter((p) => !cartProductIds.includes(p.id))
    .slice(0, 4);

  if (isLoading || recommendations.length === 0) return null;

  return (
    <div className="mt-6 rounded-card border border-surface-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
        <span className="h-2 w-2 rounded-full bg-success-500" />
        Rekomendasi Untukmu
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {recommendations.map((product) => (
          <div key={product.id} className="rounded-xl border border-surface-border p-2.5">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <Image src={getProductImage(product.images)} alt={product.name} fill className="object-cover" />
            </div>
            <p className="mt-2 truncate text-xs font-semibold text-ink-900">{product.name}</p>
            <p className="text-xs font-bold text-primary-500">{formatRupiah(product.finalPrice)}</p>
            <button
              onClick={() => {
                addToCart(product, 1);
                toast.success(`${product.name} ditambahkan ke keranjang`);
              }}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-pill bg-primary-500 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <Plus className="h-3 w-3" /> Tambah
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
