"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import AnimatedModal from "@/components/ui/AnimatedModal";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/format";

export default function RatingModal({
  productName,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  productName: string;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment: string }) => void;
  isSubmitting: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comment });
  }

  return (
    <AnimatedModal onClose={onClose}>
      <div className="w-full max-w-md rounded-card bg-white p-6">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">Beri Rating</h3>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-ink-400" />
          </button>
        </div>
        <p className="mb-5 text-sm text-ink-700">{productName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-900">Rating *</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                  aria-label={`${value} bintang`}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || rating) >= value
                        ? "fill-primary-500 text-primary-500"
                        : "fill-transparent text-surface-border"
                    )}
                  />
                </button>
              ))}
            </div>
            {rating === 0 && (
              <p className="mt-1.5 text-xs text-ink-400">Ketuk bintang untuk memberi rating</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Komentar</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagaimana rasa & kualitas pesanannya?"
              className="w-full resize-none rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Mengirim..." : "Kirim Rating"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
