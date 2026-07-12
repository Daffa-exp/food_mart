"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import PromotionModal from "@/components/admin/PromotionModal";
import { cn } from "@/utils/format";
import { useAdminPromotions, useAdminPromotionMutations } from "@/hooks/useAdmin";
import { AdminPromotion } from "@/services/admin.service";

export default function AdminPromotionsPage() {
  const { data: promotions, isLoading, isError } = useAdminPromotions();
  const { create, update, remove } = useAdminPromotionMutations();
  const [modal, setModal] = useState<{ open: boolean; data?: AdminPromotion }>({ open: false });

  function handleSubmit(payload: Record<string, unknown>) {
    if (modal.data) update.mutate({ id: modal.data.id, payload }, { onSuccess: () => setModal({ open: false }) });
    else create.mutate(payload, { onSuccess: () => setModal({ open: false }) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Promotions</h1>
          <p className="text-sm text-ink-700">Kelola banner & promosi musiman</p>
        </div>
        <Button onClick={() => setModal({ open: true })}><Plus className="h-4 w-4" /> Tambah Promosi</Button>
      </div>

      {isLoading && <div className="h-40 animate-pulse rounded-card bg-white" />}
      {isError && <p className="text-sm text-red-500">Gagal memuat promosi.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions?.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-card border border-surface-border bg-white">
            <div className="relative h-32 w-full bg-surface-cream">
              {p.bannerImageUrl && <Image src={p.bannerImageUrl} alt={p.title} fill className="object-cover" />}
              <span className={cn(
                "absolute right-2 top-2 rounded-pill px-2 py-0.5 text-[11px] font-semibold",
                p.isActive ? "bg-success-500 text-white" : "bg-white/90 text-ink-700"
              )}>
                {p.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="p-4">
              <p className="font-semibold text-ink-900">{p.title}</p>
              <p className="mt-1 text-xs text-ink-400">
                {new Date(p.startDate).toLocaleDateString("id-ID")} - {new Date(p.endDate).toLocaleDateString("id-ID")}
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setModal({ open: true, data: p })} className="flex flex-1 items-center justify-center gap-1 rounded-pill border border-surface-border py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-cream">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => confirm(`Hapus promosi "${p.title}"?`) && remove.mutate(p.id)} className="flex flex-1 items-center justify-center gap-1 rounded-pill border border-red-200 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {promotions?.length === 0 && <p className="col-span-full text-center text-sm text-ink-700">Belum ada promosi.</p>}
      </div>

      {modal.open && (
        <PromotionModal
          initialData={modal.data}
          onClose={() => setModal({ open: false })}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
