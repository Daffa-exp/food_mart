import { Check, X } from "lucide-react";
import { cn } from "@/utils/format";

const STEPS = [
  { key: "paid", label: "Pembayaran" },
  { key: "confirmed", label: "Diterima" },
  { key: "processing", label: "Diproses" },
  { key: "shipped", label: "Dikirim" },
  { key: "delivered", label: "Selesai" },
];

// Index tahap terakhir yang SUDAH selesai untuk masing-masing status order.
// Sengaja hanya mengandalkan `orderStatus` (bukan status pembayaran) supaya
// begitu admin mengubah status pesanan, progress di sisi user langsung ikut
// berubah — tidak nyangkut menunggu webhook pembayaran yang mungkin belum/
// tidak pernah masuk (mis. saat testing tanpa webhook publik).
const ORDER_STATUS_INDEX: Record<string, number> = {
  pending: -1,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

// PENTING: sebelumnya setiap step menampilkan DUA baris teks yang tumpang
// tindih maknanya (label step + caption "Selesai"/"Sedang diproses"/
// "Menunggu" tepat di bawahnya) — inilah yang bikin tampilan terasa
// berantakan. Sekarang cuma SATU baris label yang ringkas; tahap yang
// sedang aktif ditandai lewat warna + titik berdenyut, bukan teks tambahan.
export default function OrderStatusStepper({
  orderStatus,
  isPaid,
}: {
  orderStatus: string;
  isPaid: boolean;
}) {
  if (orderStatus === "cancelled" || orderStatus === "refunded") {
    return (
      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-900">
          Status Pengiriman
        </h3>
        <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
            <X className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-red-500">
            {orderStatus === "cancelled" ? "Pesanan dibatalkan" : "Dana pesanan ini telah dikembalikan"}
          </p>
        </div>
      </div>
    );
  }

  // Kalau pembayaran belum settlement dan status masih "pending", tahan di -1
  // (belum ada tahap yang selesai). Begitu admin memindahkan status pesanan
  // ke tahap manapun setelahnya, progress mengikuti status itu langsung.
  const currentIndex = orderStatus === "pending" && !isPaid ? -1 : ORDER_STATUS_INDEX[orderStatus] ?? -1;

  // Garis penghubung dibuat sebagai layer terpisah yang posisinya dihitung
  // matematis (persentase), BUKAN ikut numpang di baris yang sama dengan
  // circle. Sebelumnya circle nempel di kiri kolom sementara label di bawahnya
  // center — makanya circle & label kelihatan "geser", nggak sejajar.
  // Sekarang circle & label sama-sama center di kolom grid yang sama, jadi
  // otomatis sejajar; garisnya tinggal nyambungin titik tengah tiap circle.
  const colWidth = 100 / STEPS.length;
  const lineInset = colWidth / 2; // jarak dari tepi ke titik tengah circle pertama/terakhir
  const progressFraction = Math.max(currentIndex, 0) / (STEPS.length - 1);

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-ink-900">
          Status Pengiriman
        </h3>
        <span className="rounded-pill bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-500">
          {STEPS[Math.min(currentIndex + 1, STEPS.length - 1)]?.label ?? "Menunggu"}
        </span>
      </div>

      <div className="relative">
        {/* Track garis penuh (belum tercapai) */}
        <div
          className="absolute top-4 h-0.5 -translate-y-1/2 bg-surface-border"
          style={{ left: `${lineInset}%`, right: `${lineInset}%` }}
        />
        {/* Garis progress (sudah tercapai) */}
        <div
          className="absolute top-4 h-0.5 -translate-y-1/2 bg-success-500 transition-all duration-500"
          style={{ left: `${lineInset}%`, width: `${progressFraction * (100 - lineInset * 2)}%` }}
        />

        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))` }}>
          {STEPS.map((step, i) => {
            const isDone = i <= currentIndex;
            const isActive = i === currentIndex + 1 && i <= 4 && currentIndex < 4;

            return (
              <div key={step.key} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ring-4 ring-white transition-colors",
                    isDone ? "bg-success-500" : isActive ? "bg-primary-500" : "bg-surface-border"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary-400 opacity-60" />
                  )}
                  <span className="relative">
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className={cn("block h-2 w-2 rounded-full", isActive ? "bg-white" : "bg-ink-400")} />
                    )}
                  </span>
                </span>
                <p
                  className={cn(
                    "text-[11px] font-semibold leading-tight",
                    isDone ? "text-success-500" : isActive ? "text-primary-500" : "text-ink-400"
                  )}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
