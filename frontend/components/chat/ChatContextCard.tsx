import { Package, Receipt } from "lucide-react";
import { formatRupiah } from "@/utils/format";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Direfund",
};

export interface ChatCardMetadata {
  kind: "product_card" | "order_card";
  name?: string;
  slug?: string;
  imageUrl?: string | null;
  price?: number;
  originalPrice?: number | null;
  orderNumber?: string;
  status?: string;
  itemsSummary?: string;
  totalAmount?: number;
}

export default function ChatContextCard({ metadata }: { metadata: ChatCardMetadata }) {
  if (metadata.kind === "product_card") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-white p-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-cream">
          {metadata.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={metadata.imageUrl} alt={metadata.name ?? "Produk"} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-6 w-6 text-ink-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{metadata.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-primary-500">{formatRupiah(metadata.price ?? 0)}</p>
            {metadata.originalPrice ? (
              <p className="text-xs text-ink-400 line-through">{formatRupiah(metadata.originalPrice)}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (metadata.kind === "order_card") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-surface-border bg-white p-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-cream">
          {metadata.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={metadata.imageUrl} alt="Pesanan" className="h-full w-full object-cover" />
          ) : (
            <Receipt className="h-6 w-6 text-ink-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">Resi #{metadata.orderNumber}</p>
          <p className="truncate text-xs text-ink-700">{metadata.itemsSummary}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-pill bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-500">
              {STATUS_LABEL[metadata.status ?? ""] ?? metadata.status}
            </span>
            <span className="text-xs font-semibold text-ink-900">{formatRupiah(metadata.totalAmount ?? 0)}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
