"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AnimatedModal from "@/components/ui/AnimatedModal";
import ImageUploader from "@/components/ui/ImageUploader";
import { AdminBanner } from "@/services/admin.service";

export default function BannerModal({
  initialData, onClose, onSubmit, isSubmitting,
}: {
  initialData?: AdminBanner;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    imageUrl: initialData?.imageUrl ?? "",
    videoUrl: initialData?.videoUrl ?? "",
    linkUrl: initialData?.linkUrl ?? "",
    displayOrder: initialData?.displayOrder ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl && !form.videoUrl) {
      alert("Isi minimal salah satu: upload gambar banner, atau isi link video (YouTube/Vimeo)");
      return;
    }
    onSubmit({ ...form, displayOrder: Number(form.displayOrder) });
  }

  return (
    <AnimatedModal onClose={onClose}>
      <div className="w-full max-w-md rounded-card bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">{initialData ? "Edit Banner" : "Tambah Banner"}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-ink-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <ImageUploader
            label="Gambar Banner (opsional kalau isi link video)"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            folder="banners"
          />
          <div>
            <Input
              label="Link Video — YouTube/Vimeo (opsional)"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
            <p className="mt-1 text-xs text-ink-400">
              Kalau diisi, banner ini akan tampil sebagai video yang bisa diputar
              di homepage (menggantikan gambar).
            </p>
          </div>
          <Input label="URL Tujuan (opsional)" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
          <Input label="Urutan Tampil" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-primary-500" />
            Aktif
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
