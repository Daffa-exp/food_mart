"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadService } from "@/services/upload.service";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "banners" | "products" | "avatars" | "misc";
  label?: string;
}

export default function ImageUploader({ value, onChange, folder = "misc", label = "Gambar" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file, folder);
      onChange(result.url);
      toast.success("Gambar berhasil diupload");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload gambar");
    } finally {
      setIsUploading(false);
    }
  }

  function handleApplyUrl() {
    if (!urlDraft.trim()) return;
    onChange(urlDraft.trim());
    setUrlDraft("");
    setShowUrlInput(false);
  }

  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-ink-900">{label}</label>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative h-40 w-full overflow-hidden rounded-input border border-surface-border bg-surface-cream/60">
          <Image src={value} alt="Preview" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            aria-label="Hapus gambar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-x-0 bottom-0 bg-black/50 py-1.5 text-center text-xs font-medium text-white hover:bg-black/70"
          >
            Ganti Gambar
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex h-40 w-full flex-col items-center justify-center gap-2 rounded-input border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary-400 bg-primary-50/50 text-primary-500"
                : "border-surface-border bg-surface-cream/40 text-ink-400 hover:border-primary-400 hover:text-primary-500"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Mengupload...</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Klik atau seret gambar ke sini (maks 5MB)</span>
              </>
            )}
          </button>

          <div className="mt-2">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-primary-500"
              >
                <Link2 className="h-3 w-3" /> atau masukkan URL gambar (opsional)
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-input border border-surface-border bg-white px-3 py-2 text-xs outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="shrink-0 rounded-input bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600"
                >
                  Pakai
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUrlInput(false); setUrlDraft(""); }}
                  className="shrink-0 text-xs text-ink-400 hover:text-ink-700"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
