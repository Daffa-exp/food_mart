"use client";

import { Zap, Rocket, Package } from "lucide-react";
import { cn, formatRupiah } from "@/utils/format";
import { DELIVERY_OPTIONS } from "@/utils/pricing";

const ICONS = { instant: Zap, same_day: Rocket, regular: Package };

interface DeliveryMethodSelectorProps {
  value: string;
  onChange: (value: "instant" | "same_day" | "regular") => void;
  freeShipping: boolean;
  shippingFee: Record<"instant" | "same_day" | "regular", number>;
}

export default function DeliveryMethodSelector({
  value,
  onChange,
  freeShipping,
  shippingFee,
}: DeliveryMethodSelectorProps) {
  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary-500" />
        <h2 className="text-sm font-bold text-ink-900">Metode Pengiriman</h2>
      </div>

      <div className="space-y-2.5">
        {DELIVERY_OPTIONS.map((option) => {
          const Icon = ICONS[option.value];
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-input border px-4 py-3 text-left transition-colors",
                isActive
                  ? "border-primary-500 bg-primary-50"
                  : "border-surface-border hover:border-primary-200"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  isActive ? "bg-primary-500 text-white" : "bg-surface-cream text-ink-700"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900">{option.label}</p>
                <p className="text-xs text-ink-400">{option.duration}</p>
              </div>
              <span className="text-sm font-semibold text-ink-900">
                {freeShipping ? (
                  <span className="text-success-500">Gratis</span>
                ) : (
                  formatRupiah(shippingFee[option.value])
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
