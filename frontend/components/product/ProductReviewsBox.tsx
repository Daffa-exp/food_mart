"use client";

import { useMemo, useState } from "react";
import { Star, MessageSquareText, ShieldCheck } from "lucide-react";
import { Product } from "@/types/entities";
import { useProductReviews } from "@/hooks/useProducts";

const PAGE_SIZE = 5;

function StarRow({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? "fill-primary-500 text-primary-500" : "text-surface-border"}`}
        />
      ))}
    </div>
  );
}

export default function ProductReviewsBox({ product }: { product: Product }) {
  const { data: reviews, isLoading, isError } = useProductReviews(product.id);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = bintang 1 ... index 4 = bintang 5
    (reviews ?? []).forEach((r) => {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      counts[idx] += 1;
    });
    const total = (reviews ?? []).length;
    return counts
      .map((count, i) => ({ star: i + 1, count, percent: total > 0 ? (count / total) * 100 : 0 }))
      .reverse(); // tampilkan dari bintang 5 ke 1
  }, [reviews]);

  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-900">
        <MessageSquareText className="h-4 w-4 text-primary-500" />
        Ulasan Pembeli
      </h3>

      {isLoading && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-input bg-surface-cream" />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-3 text-sm text-red-500">Gagal memuat ulasan produk.</p>
      )}

      {reviews && reviews.length === 0 && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-input border border-dashed border-surface-border py-10 text-center">
          <Star className="h-8 w-8 text-ink-400" />
          <p className="text-sm font-medium text-ink-900">Belum ada ulasan</p>
          <p className="text-xs text-ink-400">
            Jadilah yang pertama memberi ulasan setelah pesananmu selesai
          </p>
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <>
          {/* Ringkasan rating */}
          <div className="mt-4 flex flex-col gap-5 border-b border-surface-border pb-5 sm:flex-row sm:items-center">
            <div className="flex shrink-0 flex-col items-center justify-center sm:w-32">
              <span className="text-3xl font-extrabold text-ink-900">{product.rating.toFixed(1)}</span>
              <StarRow value={product.rating} />
              <span className="mt-1 text-xs text-ink-400">
                {product.ratingCount.toLocaleString("id-ID")} ulasan
              </span>
            </div>

            <div className="flex-1 space-y-1.5">
              {breakdown.map(({ star, count, percent }) => (
                <div key={star} className="flex items-center gap-2 text-xs text-ink-700">
                  <span className="w-8 shrink-0">{star} <Star className="inline h-3 w-3 fill-primary-500 text-primary-500" /></span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-cream">
                    <div
                      className="h-full rounded-pill bg-primary-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-ink-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daftar ulasan */}
          <ul className="mt-4 space-y-4">
            {reviews.slice(0, visibleCount).map((review) => (
              <li key={review.id} className="border-b border-surface-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-500">
                      {review.userName.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{review.userName}</p>
                      <StarRow value={review.rating} size="h-3 w-3" />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-ink-400">
                    {new Date(review.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </span>
                </div>

                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{review.comment}</p>
                )}

                {review.adminReply && (
                  <div className="mt-2.5 flex gap-2 rounded-input bg-surface-cream p-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                    <div>
                      <p className="text-xs font-semibold text-primary-500">Tanggapan FoodMart</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-700">{review.adminReply}</p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {visibleCount < reviews.length && (
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="mt-4 w-full rounded-pill border border-primary-500 py-2.5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
            >
              Lihat Lebih Banyak Ulasan
            </button>
          )}
        </>
      )}
    </div>
  );
}
