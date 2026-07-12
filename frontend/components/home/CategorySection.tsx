"use client";

import Link from "next/link";
import {
  Beef, Pizza, Drumstick, UtensilsCrossed, CupSoda, IceCreamCone, Cookie, Fish, LucideIcon,
} from "lucide-react";
import CategoryCard from "@/components/home/CategoryCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { useCategories } from "@/hooks/useProducts";

const ICON_MAP: Record<string, LucideIcon> = {
  Beef, Pizza, Drumstick, UtensilsCrossed, CupSoda, IceCreamCone, Cookie, Fish,
};

export default function CategorySection() {
  const { data: categories, isLoading, isError } = useCategories();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        title="Kategori Populer"
        subtitle="Pilih kategori favoritmu — tersedia ratusan pilihan menu terbaik"
      />

      {isLoading && (
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-card bg-surface-cream" />
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-6 text-sm text-red-500">Gagal memuat kategori. Pastikan backend berjalan.</p>
      )}

      {categories && (
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/menu?kategori=${cat.slug}`}>
              <CategoryCard icon={ICON_MAP[cat.icon] ?? Beef} label={cat.name} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
