"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2, Star, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import AddressModal from "@/components/profile/AddressModal";
import { cn } from "@/utils/format";
import { useAddresses } from "@/hooks/useAccountData";
import { SavedAddress } from "@/services/address.service";

export default function SavedAddressesSection() {
  const { data: addresses, isLoading, isError, create, update, remove, setDefault } = useAddresses();
  const [modal, setModal] = useState<{ open: boolean; data?: SavedAddress }>({ open: false });

  function handleSubmit(payload: Parameters<typeof create.mutate>[0]) {
    if (modal.data) {
      update.mutate({ id: modal.data.id, payload }, { onSuccess: () => setModal({ open: false }) });
    } else {
      create.mutate(payload, { onSuccess: () => setModal({ open: false }) });
    }
  }

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-900">Alamat Tersimpan</h3>
        <Button size="sm" variant="outline" onClick={() => setModal({ open: true })}>
          <Plus className="h-3.5 w-3.5" /> Tambah
        </Button>
      </div>

      {isLoading && <div className="h-24 animate-pulse rounded-input bg-surface-cream" />}
      {isError && <p className="text-sm text-red-500">Gagal memuat alamat.</p>}

      {addresses && addresses.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-input border border-dashed border-surface-border py-8 text-center">
          <MapPin className="h-6 w-6 text-ink-400" />
          <p className="text-sm text-ink-700">Belum ada alamat tersimpan</p>
          <p className="text-xs text-ink-400">Simpan alamat supaya tidak perlu ketik ulang saat checkout</p>
        </div>
      )}

      <div className="space-y-3">
        {addresses?.map((addr) => (
          <div
            key={addr.id}
            className={cn(
              "rounded-input border p-4",
              addr.isDefault ? "border-primary-300 bg-primary-50/40" : "border-surface-border"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">{addr.recipientName}</p>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 rounded-pill bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Star className="h-2.5 w-2.5 fill-white" /> Utama
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-700">{addr.phoneNumber}</p>
                <p className="mt-1 text-sm text-ink-700">{addr.fullAddress}</p>
                <p className="text-xs text-ink-400">{addr.city}, {addr.postalCode}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setModal({ open: true, data: addr })}
                  className="flex h-8 w-8 items-center justify-center rounded-input text-ink-700 hover:bg-surface-cream"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => confirm("Hapus alamat ini?") && remove.mutate(addr.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-input text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {!addr.isDefault && (
              <button
                onClick={() => setDefault.mutate(addr.id)}
                className="mt-2 text-xs font-semibold text-primary-500 hover:underline"
              >
                Jadikan alamat utama
              </button>
            )}
          </div>
        ))}
      </div>

      {modal.open && (
        <AddressModal
          initialData={modal.data}
          onClose={() => setModal({ open: false })}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending || update.isPending}
        />
      )}
    </div>
  );
}
