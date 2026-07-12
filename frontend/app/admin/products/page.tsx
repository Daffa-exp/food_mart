"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import AdminPagination from "@/components/admin/AdminPagination";
import { cn, formatRupiah } from "@/utils/format";
import { useAdminProducts, useAdminProductMutations } from "@/hooks/useAdmin";

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminProducts({ search: search || undefined, page, pageSize: PAGE_SIZE });
  const { remove, setActive } = useAdminProductMutations();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    remove.mutate(id, { onError: (e) => toast.error(e.message) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Products</h1>
          <p className="text-sm text-ink-700">Kelola seluruh produk FoodMart</p>
        </div>
        <Link href="/admin/products/new">
          <Button><Plus className="h-4 w-4" /> Tambah Produk</Button>
        </Link>
      </div>

      <div className="rounded-card border border-surface-border bg-white">
        <div className="border-b border-surface-border p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari produk..."
              className="w-full rounded-pill border border-surface-border bg-surface-cream/60 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-border">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-8 animate-pulse rounded bg-surface-cream" />
                    </td>
                  </tr>
                ))}

              {isError && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-red-500">Gagal memuat produk.</td></tr>
              )}

              {data?.data.map((p) => (
                <tr key={p.id} className="border-b border-surface-border hover:bg-surface-cream/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-cream">
                        {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{p.categoryLabel}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{formatRupiah(p.finalPrice)}</p>
                    {p.discountPercentage > 0 && (
                      <p className="text-xs text-ink-400 line-through">{formatRupiah(p.price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-medium", p.stockQuantity <= 10 ? "text-amber-600" : "text-ink-900")}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setActive.mutate({ id: p.id, isActive: !p.isActive })}
                      className={cn(
                        "flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
                        p.isActive ? "bg-success-50 text-success-500" : "bg-surface-cream text-ink-400"
                      )}
                    >
                      {p.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-input text-ink-700 hover:bg-surface-cream"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-input text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {data && data.data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-700">Belum ada produk.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {data && <AdminPagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </div>
    </div>
  );
}
