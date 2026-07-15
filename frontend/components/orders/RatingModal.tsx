"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Star, X, Camera, ImagePlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AnimatedModal from "@/components/ui/AnimatedModal";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/format";
import { uploadService } from "@/services/upload.service";

const MAX_PHOTOS = 3;

export default function RatingModal({
  productName,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  productName: string;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment: string; imageUrls: string[] }) => void;
  isSubmitting: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ rating, comment, imageUrls: photos });
  }

  async function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // supaya bisa pilih file yang sama lagi kalau perlu
    if (!file) return;

    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maksimal ${MAX_PHOTOS} foto per ulasan`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const result = await uploadService.uploadImage(file, "reviews");
      setPhotos((prev) => [...prev, result.url]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">
              Foto <span className="font-normal text-ink-400">(opsional, maks {MAX_PHOTOS})</span>
            </label>

            {/* Dua input file tersembunyi: satu buat buka kamera langsung
                (capture="environment"), satu lagi buka galeri biasa. Dipisah
                jadi 2 tombol supaya pilihannya jelas, bukan bergantung ke
                perilaku browser yang beda-beda kalau digabung jadi 1 input. */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePickFile}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePickFile}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              {photos.map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-input border border-surface-border">
                  <Image src={url} alt="Foto ulasan" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white"
                    aria-label="Hapus foto"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-input border border-dashed border-surface-border text-ink-400 transition-colors hover:border-primary-400 hover:text-primary-500 disabled:opacity-50"
                  >
                    {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    <span className="text-[10px]">Kamera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-input border border-dashed border-surface-border text-ink-400 transition-colors hover:border-primary-400 hover:text-primary-500 disabled:opacity-50"
                  >
                    {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    <span className="text-[10px]">Galeri</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isSubmitting || rating === 0 || isUploadingPhoto}>
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
