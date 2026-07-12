"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import CouponModal from "@/components/admin/CouponModal";
import { cn, formatRupiah } from "@/utils/format";
import { useAdminCoupons, useAdminCouponMutations } from "@/hooks/useAdmin";
import { AdminCoupon } from "@/services/admin.service";

export default function AdminCouponsPage() {
  const { data: coupons, isLoading, isError } = useAdminCoupons();
  const { create, update, remove } = useAdminCouponMutations();
  const [modal, setModal] = useState<{ open: boolean; data?: AdminCoupon }>({ open: false });

  function handleSubmit(payload: Record<string, unknown>) {
    if (modal.data) update.mutate({ id: modal.data.id, payload }, { onSuccess: () => setModal({ open: false }) });
    else create.mutate(payload, { onSuccess: () => setModal({ open: false }) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Coupons</h1>
          <p className="text-sm text-ink-700">Kelola kode promo & diskon</p>
        </div>
        <Button onClick={() => setModal({ open: true })}><Plus className="h-4 w-4" /> Tambah Kupon</Button>
      </div>

      <div className="rounded-card border border-surface-border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Nilai</th>
              <th className="px-4 py-3">Terpakai</th>
              <th className="px-4 py-3">Berlaku</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-700">Memuat...</td></tr>}
            {isError && <tr><td colSpan={7} className="px-4 py-8 text-center text-red-500">Gagal memuat kupon.</td></tr>}
            {coupons?.map((c) => (
              <tr key={c.id} className="border-b border-surface-border hover:bg-surface-cream/40">
                <td className="px-4 py-3 font-semibold text-ink-900">{c.code}</td>
                <td className="px-4 py-3 text-ink-700">
                  {c.type === "percentage" ? "Persentase" : c.type === "fixed_amount" ? "Nominal" : "Gratis Ongkir"}
                </td>
                <td className="px-4 py-3 text-ink-700">
                  {c.type === "percentage" ? `${c.value}%` : c.type === "fixed_amount" ? formatRupiah(c.value) : "-"}
                </td>
                <td className="px-4 py-3 text-ink-700">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="px-4 py-3 text-ink-400 text-xs">
                  {new Date(c.validFrom).toLocaleDateString("id-ID")} - {new Date(c.validUntil).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-pill px-2.5 py-1 text-xs font-semibold", c.isActive ? "bg-success-50 text-success-500" : "bg-surface-cream text-ink-400")}>
                    {c.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setModal({ open: true, data: c })} className="flex h-8 w-8 items-center justify-center rounded-input text-ink-700 hover:bg-surface-cream">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => confirm(`Hapus kupon ${c.code}?`) && remove.mutate(c.id)} className="flex h-8 w-8 items-center justify-center rounded-input text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons?.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-700">Belum ada kupon.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <CouponModal
          initialData={modal.data}
          onClose={() => setModal({ open: false })}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
