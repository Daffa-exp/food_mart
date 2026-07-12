"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { AdminPromotion } from "@/services/admin.service";

export default function PromotionModal({
  initialData, onClose, onSubmit, isSubmitting,
}: {
  initialData?: AdminPromotion;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    bannerImageUrl: initialData?.bannerImageUrl ?? "",
    discountPercentage: initialData?.discountPercentage ?? undefined,
    startDate: initialData?.startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    endDate: initialData?.endDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    isActive: initialData?.isActive ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...form, discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : undefined });
  }

  return (
    <AnimatedModal onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">{initialData ? "Edit Promosi" : "Tambah Promosi"}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-ink-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="URL Banner" value={form.bannerImageUrl} onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })} />
          <Input label="Diskon (%)" type="number" value={form.discountPercentage ?? ""} onChange={(e) => setForm({ ...form, discountPercentage: Number(e.target.value) })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mulai" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="Selesai" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-primary-500" />
            Aktif
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
