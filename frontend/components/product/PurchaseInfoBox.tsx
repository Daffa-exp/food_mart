import { CreditCard, Truck, Clock } from "lucide-react";

const PAYMENT_METHODS = ["QRIS", "GoPay", "OVO", "DANA", "ShopeePay", "BCA VA", "BNI VA", "BRI VA", "Mandiri VA"];
const COURIERS = ["JNE", "J&T Express", "SiCepat", "AnterAja", "Ninja Xpress"];

export default function PurchaseInfoBox() {
  return (
    <div className="space-y-4">
      <div className="rounded-card border border-surface-border bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
          <CreditCard className="h-4 w-4 text-primary-500" />
          Metode Pembayaran
        </div>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <span
              key={method}
              className="rounded-pill border border-surface-border bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-ink-700"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Truck className="h-4 w-4 text-primary-500" />
          Pengiriman
        </div>
        <div className="flex flex-wrap gap-2">
          {COURIERS.map((courier) => (
            <span
              key={courier}
              className="rounded-pill border border-surface-border bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-ink-700"
            >
              {courier}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5 rounded-input bg-success-50 px-3 py-2 text-xs font-medium text-success-500">
          <Clock className="h-3.5 w-3.5" />
          Estimasi Tiba: 30–60 Menit
        </div>
        <p className="mt-2 text-xs text-primary-500">
          Gratis Ongkir untuk pembelian di atas Rp50.000
        </p>
      </div>
    </div>
  );
}
