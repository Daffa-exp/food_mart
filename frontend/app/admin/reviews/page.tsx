"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Eye, EyeOff, Send } from "lucide-react";
import { cn } from "@/utils/format";
import { useAdminReviews, useAdminReviewMutations } from "@/hooks/useAdmin";

export default function AdminReviewsPage() {
  const { data: reviews, isLoading, isError } = useAdminReviews();
  const { reply, setVisibility } = useAdminReviewMutations();
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Reviews</h1>
        <p className="text-sm text-ink-700">Kelola ulasan & rating dari pelanggan</p>
      </div>

      {isLoading && <div className="h-40 animate-pulse rounded-card bg-white" />}
      {isError && <p className="text-sm text-red-500">Gagal memuat ulasan.</p>}

      <div className="space-y-3">
        {reviews?.map((r) => (
          <div key={r.id} className="rounded-card border border-surface-border bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink-900">{r.userName}</p>
                <p className="text-xs text-ink-400">untuk {r.productName}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-primary-500 text-primary-500" : "text-surface-border")} />
                  ))}
                </div>
                <button
                  onClick={() => setVisibility.mutate({ id: r.id, isVisible: !r.isVisible })}
                  className={cn(
                    "flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
                    r.isVisible ? "bg-success-50 text-success-500" : "bg-surface-cream text-ink-400"
                  )}
                >
                  {r.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {r.isVisible ? "Tampil" : "Tersembunyi"}
                </button>
              </div>
            </div>
            {r.comment && <p className="mt-3 text-sm text-ink-700">{r.comment}</p>}

            {r.imageUrls && r.imageUrls.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {r.imageUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block h-16 w-16 overflow-hidden rounded-input border border-surface-border"
                  >
                    <Image src={url} alt="Foto dari pembeli" fill className="object-cover" unoptimized />
                  </a>
                ))}
              </div>
            )}

            {r.adminReply && (
              <div className="mt-3 rounded-input bg-primary-50 p-3 text-sm text-ink-700">
                <span className="font-semibold text-primary-500">Balasan Admin: </span>{r.adminReply}
              </div>
            )}

            {!r.adminReply && (
              <div className="mt-3 flex gap-2">
                <input
                  value={replyDrafts[r.id] ?? ""}
                  onChange={(e) => setReplyDrafts({ ...replyDrafts, [r.id]: e.target.value })}
                  placeholder="Tulis balasan..."
                  className="flex-1 rounded-input border border-surface-border bg-surface-cream/60 px-3.5 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
                />
                <button
                  onClick={() => replyDrafts[r.id] && reply.mutate({ id: r.id, reply: replyDrafts[r.id] })}
                  className="flex items-center gap-1 rounded-pill bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600"
                >
                  <Send className="h-3.5 w-3.5" /> Kirim
                </button>
              </div>
            )}
          </div>
        ))}
        {reviews?.length === 0 && <p className="text-center text-sm text-ink-700">Belum ada ulasan.</p>}
      </div>
    </div>
  );
}
