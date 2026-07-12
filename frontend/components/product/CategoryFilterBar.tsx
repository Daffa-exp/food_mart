"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid, Beef, Pizza, Drumstick, UtensilsCrossed,
  CupSoda, IceCreamCone, Cookie, Fish, LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/format";
import { useCategories } from "@/hooks/useProducts";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutGrid, Beef, Pizza, Drumstick, UtensilsCrossed,
  CupSoda, IceCreamCone, Cookie, Fish,
};

interface CategoryFilterBarProps {
  active: string;
  onChange: (slug: string) => void;
}

export default function CategoryFilterBar({ active, onChange }: CategoryFilterBarProps) {
  const { data: categories, isLoading } = useCategories();

  const items = [
    { slug: "semua", name: "Semua", icon: "LayoutGrid" },
    ...(categories ?? []),
  ];

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-pill bg-surface-cream" />
        ))}
      </div>
    );
  }

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {items.map((cat) => {
        const Icon = ICON_MAP[cat.icon] ?? LayoutGrid;
        const isActive = active === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => onChange(cat.slug)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-surface-border bg-white text-ink-700 hover:border-primary-300 hover:text-primary-500"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill-active"
                className="absolute inset-0 -z-10 rounded-pill bg-primary-500"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="h-3.5 w-3.5" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
