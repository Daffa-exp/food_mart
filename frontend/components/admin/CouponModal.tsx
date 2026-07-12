"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { AdminCoupon } from "@/services/admin.service";

export default function CouponModal({
  initialData, onClose, onSubmit, isSubmitting,
}: {
  initialData?: AdminCoupon;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    code: initialData?.code ?? "",
    description: initialData?.description ?? "",
    type: initialData?.type ?? "percentage",
    value: initialData?.value ?? 10,
    minPurchase: initialData?.minPurchase ?? 0,
    maxDiscount: initialData?.maxDiscount ?? undefined,
    usageLimit: initialData?.usageLimit ?? undefined,
    validFrom: initialData?.validFrom?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    validUntil: initialData?.validUntil?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    isActive: initialData?.isActive ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      ...form,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    });
  }

  return (
    <AnimatedModal onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">{initialData ? "Edit Kupon" : "Tambah Kupon"}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-ink-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Kode Kupon" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          <Input label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Tipe Diskon</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
              className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white"
            >
              <option value="percentage">Persentase (%)</option>
              <option value="fixed_amount">Nominal Tetap (Rp)</option>
              <option value="free_shipping">Gratis Ongkir</option>
            </select>
          </div>

          {form.type !== "free_shipping" && (
            <Input
              label={form.type === "percentage" ? "Nilai (%)" : "Nilai (Rp)"}
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Min. Belanja (Rp)" type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })} />
            <Input label="Maks. Diskon (Rp)" type="number" value={form.maxDiscount ?? ""} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} />
          </div>

          <Input label="Batas Pemakaian" type="number" value={form.usageLimit ?? ""} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Berlaku Dari" type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
            <Input label="Berlaku Sampai" type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
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
