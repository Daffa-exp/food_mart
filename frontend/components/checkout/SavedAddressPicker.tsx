"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { MapPin, Check } from "lucide-react";
import { cn } from "@/utils/format";
import { useAddresses } from "@/hooks/useAccountData";
import { useUser } from "@/hooks/useUser";
import { CheckoutFormValues } from "@/utils/checkout-validation";

export default function SavedAddressPicker({ form }: { form: UseFormReturn<CheckoutFormValues> }) {
  const { user } = useUser();
  const { data: addresses, isLoading } = useAddresses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  if (!user || isLoading) return null;
  if (!addresses || addresses.length === 0) return null;

  function applyAddress(addr: NonNullable<typeof addresses>[number]) {
    setSelectedId(addr.id);
    setShowManualForm(false);
    form.setValue("fullName", addr.recipientName, { shouldValidate: true });
    form.setValue("phoneNumber", addr.phoneNumber, { shouldValidate: true });
    form.setValue("fullAddress", addr.fullAddress, { shouldValidate: true });
    form.setValue("addressNote", addr.addressNote ?? "");
    form.setValue("city", addr.city, { shouldValidate: true });
    form.setValue("postalCode", addr.postalCode, { shouldValidate: true });
  }

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary-500" />
        <h2 className="text-sm font-bold text-ink-900">Pilih Alamat Tersimpan</h2>
      </div>

      <div className="space-y-2.5">
        {addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => applyAddress(addr)}
            className={cn(
              "flex w-full items-start gap-3 rounded-input border p-3.5 text-left transition-colors",
              selectedId === addr.id
                ? "border-primary-500 bg-primary-50"
                : "border-surface-border hover:border-primary-200"
            )}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary-500">
              {selectedId === addr.id && <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink-900">{addr.recipientName}</p>
                {addr.isDefault && (
                  <span className="rounded-pill bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-500">
                    Utama
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-700">{addr.phoneNumber}</p>
              <p className="mt-0.5 text-xs text-ink-700">{addr.fullAddress}, {addr.city}</p>
            </div>
          </button>
        ))}

        <button
          type="button"
          onClick={() => { setShowManualForm(true); setSelectedId(null); }}
          className={cn(
            "flex w-full items-center gap-2 rounded-input border border-dashed p-3.5 text-sm font-medium transition-colors",
            showManualForm
              ? "border-primary-500 bg-primary-50 text-primary-500"
              : "border-surface-border text-ink-700 hover:border-primary-300"
          )}
        >
          <MapPin className="h-4 w-4" /> Isi alamat baru secara manual
        </button>
      </div>

      {(selectedId || showManualForm) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-success-500">
          <Check className="h-3.5 w-3.5" />
          {showManualForm ? "Silakan isi form alamat di bawah" : "Form pengiriman sudah terisi otomatis"}
        </p>
      )}
    </div>
  );
}
