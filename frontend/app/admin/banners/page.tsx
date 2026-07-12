"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Video } from "lucide-react";
import Button from "@/components/ui/Button";
import BannerModal from "@/components/admin/BannerModal";
import { cn, getProductImage } from "@/utils/format";
import { useAdminBanners, useAdminBannerMutations } from "@/hooks/useAdmin";
import { AdminBanner } from "@/services/admin.service";

export default function AdminBannersPage() {
  const { data: banners, isLoading, isError } = useAdminBanners();
  const { create, update, remove } = useAdminBannerMutations();
  const [modal, setModal] = useState<{ open: boolean; data?: AdminBanner }>({ open: false });

  function handleSubmit(payload: Record<string, unknown>) {
    if (modal.data) update.mutate({ id: modal.data.id, payload }, { onSuccess: () => setModal({ open: false }) });
    else create.mutate(payload, { onSuccess: () => setModal({ open: false }) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Banners</h1>
          <p className="text-sm text-ink-700">Kelola banner promosi di halaman Home</p>
        </div>
        <Button onClick={() => setModal({ open: true })}><Plus className="h-4 w-4" /> Tambah Banner</Button>
      </div>

      {isLoading && <div className="h-40 animate-pulse rounded-card bg-white" />}
      {isError && <p className="text-sm text-red-500">Gagal memuat banner.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners?.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-card border border-surface-border bg-white">
            <div className="relative h-32 w-full bg-surface-cream">
              <Image src={getProductImage([b.imageUrl])} alt={b.title ?? "Banner"} fill className="object-cover" />
              {b.videoUrl && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-pill bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Video className="h-3 w-3" /> Video
                </span>
              )}
              <span className={cn(
                "absolute right-2 top-2 rounded-pill px-2 py-0.5 text-[11px] font-semibold",
                b.isActive ? "bg-success-500 text-white" : "bg-white/90 text-ink-700"
              )}>
                {b.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="p-4">
              <p className="font-semibold text-ink-900">{b.title ?? "(Tanpa judul)"}</p>
              <p className="text-xs text-ink-400">Urutan: {b.displayOrder}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setModal({ open: true, data: b })} className="flex flex-1 items-center justify-center gap-1 rounded-pill border border-surface-border py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-cream">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => confirm("Hapus banner ini?") && remove.mutate(b.id)} className="flex flex-1 items-center justify-center gap-1 rounded-pill border border-red-200 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners?.length === 0 && <p className="col-span-full text-center text-sm text-ink-700">Belum ada banner.</p>}
      </div>

      {modal.open && (
        <BannerModal
          initialData={modal.data}
          onClose={() => setModal({ open: false })}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
