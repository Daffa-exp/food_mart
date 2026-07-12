"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn, formatRupiah } from "@/utils/format";
import { useCartStore } from "@/store/cart-store";
import { Product } from "@/types/entities";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function FrequentlyBoughtBox({ products }: { products: Product[] }) {
  const [checked, setChecked] = useState<string[]>(products.map((p) => p.id));
  const addItem = useCartStore((s) => s.addItem);

  if (products.length === 0) return null;

  function toggle(id: string) {
    setChecked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  const selectedItems = products.filter((p) => checked.includes(p.id));
  const total = selectedItems.reduce((sum, p) => sum + p.finalPrice, 0);

  function handleAddAll() {
    selectedItems.forEach((item) => addItem(item, 1));
    toast.success(`${selectedItems.length} item ditambahkan ke keranjang`);
  }

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <h4 className="mb-3 text-sm font-bold text-ink-900">Sering Dibeli Bersama</h4>
      <div className="space-y-2.5">
        {products.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-input p-2 hover:bg-surface-cream"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                checked.includes(item.id)
                  ? "border-primary-500 bg-primary-500"
                  : "border-surface-border bg-white"
              )}
            >
              {checked.includes(item.id) && <Check className="h-3.5 w-3.5 text-white" />}
            </button>
            <span className="flex-1 text-sm text-ink-700">{item.name}</span>
            <span className="text-sm font-semibold text-ink-900">{formatRupiah(item.finalPrice)}</span>
          </label>
        ))}
      </div>
      {selectedItems.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-4">
          <span className="text-sm text-ink-700">
            Total: <span className="font-bold text-ink-900">{formatRupiah(total)}</span>
          </span>
          <Button size="sm" onClick={handleAddAll}>
            Tambah Semua
          </Button>
        </div>
      )}
    </div>
  );
}
