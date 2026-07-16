"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { cn, formatRupiah } from "@/utils/format";
import { Order, OrderStatus } from "@/types/entities";
import { useMyReviews, useSubmitReview } from "@/hooks/useAccountData";
import RatingModal from "@/components/orders/RatingModal";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Menunggu Pembayaran", className: "bg-surface-cream text-ink-700" },
  confirmed: { label: "Pesanan Diterima", className: "bg-primary-50 text-primary-500" },
  processing: { label: "Sedang Diproses", className: "bg-primary-50 text-primary-500" },
  shipped: { label: "Sedang Dikirim", className: "bg-primary-50 text-primary-500" },
  delivered: { label: "Pesanan Selesai", className: "bg-success-50 text-success-500" },
  cancelled: { label: "Dibatalkan", className: "bg-red-50 text-red-500" },
  refunded: { label: "Dana Dikembalikan", className: "bg-red-50 text-red-500" },
};

export default function OrderHistoryCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status];
  const { data: myReviews } = useMyReviews();
  const submitReview = useSubmitReview();
  const [reviewingItem, setReviewingItem] = useState<{ id: string; productName: string } | null>(null);

  const reviewedItemIds = new Set((myReviews ?? []).map((r) => r.orderItemId));

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-primary-500" />
          <span className="font-bold text-ink-900">#{order.order_number}</span>
          <span className="text-ink-400">
            {new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
          </span>
        </div>
        <span className={cn("rounded-pill px-2.5 py-1 text-xs font-semibold", status.className)}>
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ink-400">
        <span>Produk Dipesan</span>
        <Link href={`/checkout/berhasil?order_id=${order.id}`} className="flex items-center gap-1 text-primary-500 normal-case">
          Info Pesanan <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <ul className="mt-2 space-y-2.5">
        {order.order_items.map((item) => {
          const alreadyReviewed = reviewedItemIds.has(item.id);
          return (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-ink-700">{item.product_name}</span>
              <div className="flex items-center gap-3">
                <span className="text-ink-400">{item.quantity}x item</span>
                {order.status === "delivered" && (
                  <button
                    type="button"
                    onClick={() => !alreadyReviewed && setReviewingItem({ id: item.id, productName: item.product_name })}
                    disabled={alreadyReviewed}
                    className={cn(
                      "flex items-center gap-1 rounded-pill border px-2.5 py-1 text-xs font-semibold transition-colors",
                      alreadyReviewed
                        ? "border-success-500 bg-success-50 text-success-500"
                        : "border-primary-500 text-primary-500 hover:bg-primary-50"
                    )}
                  >
                    <Star className={cn("h-3 w-3", alreadyReviewed && "fill-success-500")} />
                    {alreadyReviewed ? "Sudah Dirating" : "Beri Rating"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3 text-sm">
        <span className="text-ink-400">Total Pembayaran</span>
        <span className="font-bold text-ink-900">{formatRupiah(order.total_amount)}</span>
      </div>

      {reviewingItem && (
        <RatingModal
          productName={reviewingItem.productName}
          isSubmitting={submitReview.isPending}
          onClose={() => setReviewingItem(null)}
          onSubmit={({ rating, comment, photos }) =>
            submitReview.mutate(
              { orderItemId: reviewingItem.id, rating, comment: comment || undefined, photos },
              { onSuccess: () => setReviewingItem(null) }
            )
          }
        />
      )}
    </div>
  );
}
