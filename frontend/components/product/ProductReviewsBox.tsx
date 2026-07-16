"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star, MessageSquareText, ShieldCheck, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/entities";
import { useProductReviews } from "@/hooks/useProducts";
import { cn } from "@/utils/format";

const PAGE_SIZE = 5;
const AVATAR_COLORS = [
  "bg-primary-50 text-primary-500",
  "bg-blue-50 text-blue-500",
  "bg-purple-50 text-purple-500",
  "bg-amber-50 text-amber-600",
  "bg-teal-50 text-teal-600",
];

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function StarRow({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(value) ? "fill-primary-500 text-primary-500" : "fill-surface-cream text-surface-border"}`}
        />
      ))}
    </div>
  );
}

export default function ProductReviewsBox({ product }: { product: Product }) {
  const { data: reviews, isLoading, isError } = useProductReviews(product.id);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

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

  const withPhotoCount = useMemo(
    () => (reviews ?? []).filter((r) => r.imageUrls && r.imageUrls.length > 0).length,
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (starFilter === null) return reviews;
    return reviews.filter((r) => Math.round(r.rating) === starFilter);
  }, [reviews, starFilter]);

  return (
    <div className="rounded-card border border-surface-border bg-white p-5 sm:p-6">
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

      {isError && <p className="mt-3 text-sm text-red-500">Gagal memuat ulasan produk.</p>}

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
          <div className="mt-4 flex flex-col gap-6 rounded-input bg-surface-cream/60 p-5 sm:flex-row sm:items-center">
            <div className="flex shrink-0 flex-col items-center justify-center sm:w-36 sm:border-r sm:border-surface-border sm:pr-6">
              <span className="text-4xl font-extrabold leading-none text-ink-900">{product.rating.toFixed(1)}</span>
              <div className="mt-1.5">
                <StarRow value={product.rating} size="h-4 w-4" />
              </div>
              <span className="mt-1.5 text-xs text-ink-400">
                dari {product.ratingCount.toLocaleString("id-ID")} ulasan
              </span>
            </div>

            <div className="flex-1 space-y-1.5">
              {breakdown.map(({ star, count, percent }) => (
                <button
                  key={star}
                  onClick={() => setStarFilter((prev) => (prev === star ? null : star))}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-input px-1.5 py-0.5 text-xs text-ink-700 transition-colors hover:bg-white",
                    starFilter === star && "bg-white ring-1 ring-primary-200"
                  )}
                >
                  <span className="flex w-9 shrink-0 items-center gap-0.5">
                    {star} <Star className="h-3 w-3 fill-primary-500 text-primary-500" />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-border/50">
                    <div className="h-full rounded-pill bg-primary-500 transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-ink-400">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter aktif + info foto */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {starFilter !== null && (
              <button
                onClick={() => setStarFilter(null)}
                className="flex items-center gap-1.5 rounded-pill bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white"
              >
                {starFilter} <Star className="h-3 w-3 fill-white" /> saja
                <X className="h-3 w-3" />
              </button>
            )}
            {withPhotoCount > 0 && (
              <span className="text-xs text-ink-400">{withPhotoCount} ulasan menyertakan foto</span>
            )}
          </div>

          {/* Daftar ulasan */}
          {filteredReviews.length === 0 ? (
            <p className="mt-6 text-center text-sm text-ink-400">Tidak ada ulasan dengan rating ini.</p>
          ) : (
            <ul className="mt-2 space-y-0">
              {filteredReviews.slice(0, visibleCount).map((review) => (
                <li key={review.id} className="border-b border-surface-border py-4 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                          avatarColor(review.userName)
                        )}
                      >
                        {review.userName.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-ink-900">{review.userName}</p>
                          <span className="flex items-center gap-0.5 rounded-pill bg-success-50 px-1.5 py-0.5 text-[10px] font-medium text-success-500">
                            <ShieldCheck className="h-2.5 w-2.5" /> Pembeli
                          </span>
                        </div>
                        <StarRow value={review.rating} size="h-3 w-3" />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-ink-400">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="mt-2.5 pl-11.5 text-sm leading-relaxed text-ink-700">{review.comment}</p>
                  )}

                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 pl-0 sm:pl-11">
                      {review.imageUrls.map((url, i) => (
                        <button
                          key={url}
                          onClick={() => setLightbox({ images: review.imageUrls, index: i })}
                          className="group relative block h-20 w-20 overflow-hidden rounded-input border border-surface-border"
                        >
                          <Image
                            src={url}
                            alt="Foto dari pembeli"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="mt-2.5 ml-0 flex gap-2 rounded-input bg-surface-cream p-3 sm:ml-11">
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
          )}

          {visibleCount < filteredReviews.length && (
            <button
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              className="mt-4 w-full rounded-pill border border-primary-500 py-2.5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
            >
              Lihat Lebih Banyak Ulasan
            </button>
          )}
        </>
      )}

      {/* Lightbox foto ulasan */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((l) => l && { ...l, index: (l.index - 1 + l.images.length) % l.images.length });
                }}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((l) => l && { ...l, index: (l.index + 1) % l.images.length });
                }}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative h-[70vh] w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.index]}
              alt="Foto dari pembeli"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
