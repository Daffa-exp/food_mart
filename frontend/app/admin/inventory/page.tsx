"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/format";
import { useAdminInventory, useAdminInventoryMutations } from "@/hooks/useAdmin";

export default function AdminInventoryPage() {
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data: items, isLoading, isError } = useAdminInventory(lowStockOnly);
  const { updateStock } = useAdminInventoryMutations();
  const [edits, setEdits] = useState<Record<string, number>>({});

  function handleSave(productId: string) {
    const newQty = edits[productId];
    if (newQty === undefined) return;
    updateStock.mutate({ id: productId, quantity: newQty }, {
      onSuccess: () => setEdits((prev) => { const next = { ...prev }; delete next[productId]; return next; }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Inventory</h1>
          <p className="text-sm text-ink-700">Pantau & sesuaikan stok produk</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="h-4 w-4 accent-primary-500" />
          Tampilkan stok menipis saja
        </label>
      </div>

      <div className="rounded-card border border-surface-border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Stok Saat Ini</th>
              <th className="px-4 py-3">Ambang Batas</th>
              <th className="px-4 py-3">Sesuaikan Stok</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-700">Memuat...</td></tr>}
            {isError && <tr><td colSpan={5} className="px-4 py-8 text-center text-red-500">Gagal memuat data inventory.</td></tr>}
            {items?.map((item) => (
              <tr key={item.productId} className="border-b border-surface-border hover:bg-surface-cream/40">
                <td className="px-4 py-3 font-medium text-ink-900">{item.name}</td>
                <td className="px-4 py-3">
                  <span className={cn("flex items-center gap-1 font-semibold", item.isLowStock ? "text-amber-600" : "text-ink-900")}>
                    {item.isLowStock && <AlertTriangle className="h-3.5 w-3.5" />}
                    {item.stockQuantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-400">{item.lowStockThreshold}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    value={edits[item.productId] ?? item.stockQuantity}
                    onChange={(e) => setEdits({ ...edits, [item.productId]: Number(e.target.value) })}
                    className="w-24 rounded-input border border-surface-border px-3 py-1.5 text-sm outline-none focus:border-primary-400"
                  />
                </td>
                <td className="px-4 py-3">
                  {edits[item.productId] !== undefined && edits[item.productId] !== item.stockQuantity && (
                    <Button size="sm" onClick={() => handleSave(item.productId)} disabled={updateStock.isPending}>
                      Simpan
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {items?.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-700">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
