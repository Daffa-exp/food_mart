"use client";

import { cn } from "@/utils/format";

const PAYMENT_METHODS = [
  { code: "qris", label: "QRIS" },
  { code: "gopay", label: "GoPay" },
  { code: "ovo", label: "OVO" },
  { code: "dana", label: "DANA" },
  { code: "shopeepay", label: "ShopeePay" },
  { code: "bca_va", label: "BCA VA" },
  { code: "bni_va", label: "BNI VA" },
  { code: "mandiri_va", label: "Mandiri VA" },
];

interface PaymentMethodSelectorProps {
  value: string | null;
  onChange: (code: string) => void;
}

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-900">
        Metode Pembayaran
      </h3>
      <div className="flex flex-wrap gap-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.code}
            type="button"
            onClick={() => onChange(method.code)}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
              value === method.code
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-surface-border bg-surface-cream text-ink-700 hover:border-primary-300"
            )}
          >
            {method.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-400">
        Pilihan di atas hanya preferensi — semua metode aktif tetap dapat dipilih
        di halaman pembayaran Midtrans yang akan muncul setelah konfirmasi.
      </p>
    </div>
  );
}
