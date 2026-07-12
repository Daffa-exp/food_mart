"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { slugify } from "@/utils/product-form-validation";
import { AdminCategory } from "@/types/admin";

const ICON_OPTIONS = [
  "Beef", "Pizza", "Drumstick", "UtensilsCrossed", "CupSoda",
  "IceCreamCone", "Cookie", "Fish", "Salad", "Soup",
];

interface CategoryModalProps {
  initialData?: AdminCategory;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export default function CategoryModal({ initialData, onClose, onSubmit, isSubmitting }: CategoryModalProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? ICON_OPTIONS[0]);
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder ?? 0);

  useEffect(() => {
    if (!initialData) setSlug(slugify(name));
  }, [name, initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, slug, icon, displayOrder: Number(displayOrder) });
  }

  return (
    <AnimatedModal onClose={onClose}>
      <div className="w-full max-w-md rounded-card bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">
            {initialData ? "Edit Kategori" : "Tambah Kategori"}
          </h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Kategori" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">Icon</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <Input
            label="Urutan Tampil"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
