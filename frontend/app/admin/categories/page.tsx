"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Beef, Pizza, Drumstick, UtensilsCrossed, CupSoda, IceCreamCone, Cookie, Fish, Salad, Soup, LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import CategoryModal from "@/components/admin/CategoryModal";
import { cn } from "@/utils/format";
import { useAdminCategories, useAdminCategoryMutations } from "@/hooks/useAdmin";
import { AdminCategory } from "@/types/admin";

const ICON_MAP: Record<string, LucideIcon> = {
  Beef, Pizza, Drumstick, UtensilsCrossed, CupSoda, IceCreamCone, Cookie, Fish, Salad, Soup,
};

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, isError } = useAdminCategories();
  const { create, update, remove } = useAdminCategoryMutations();
  const [modalState, setModalState] = useState<{ open: boolean; data?: AdminCategory }>({ open: false });

  function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    remove.mutate(id);
  }

  function handleSubmit(payload: Record<string, unknown>) {
    if (modalState.data) {
      update.mutate({ id: modalState.data.id, payload }, { onSuccess: () => setModalState({ open: false }) });
    } else {
      create.mutate(payload, { onSuccess: () => setModalState({ open: false }) });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Categories</h1>
          <p className="text-sm text-ink-700">Kelola kategori menu FoodMart</p>
        </div>
        <Button onClick={() => setModalState({ open: true })}>
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="rounded-card border border-surface-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Icon</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-700">Memuat...</td></tr>
            )}
            {isError && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-red-500">Gagal memuat kategori.</td></tr>
            )}
            {categories?.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] ?? Beef;
              return (
                <tr key={cat.id} className="border-b border-surface-border hover:bg-surface-cream/40">
                  <td className="px-4 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                      <IconComp className="h-4 w-4" />
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">{cat.name}</td>
                  <td className="px-4 py-3 text-ink-400">{cat.slug}</td>
                  <td className="px-4 py-3 text-ink-700">{cat.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "flex w-fit items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
                      cat.isActive ? "bg-success-50 text-success-500" : "bg-surface-cream text-ink-400"
                    )}>
                      {cat.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {cat.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setModalState({ open: true, data: cat })}
                        className="flex h-8 w-8 items-center justify-center rounded-input text-ink-700 hover:bg-surface-cream"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-input text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalState.open && (
        <CategoryModal
          initialData={modalState.data}
          onClose={() => setModalState({ open: false })}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
