"use client";

import { useState } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/utils/format";

export type SortOption = "terlaris" | "terbaru" | "harga_terendah" | "harga_tertinggi" | "rating";

const QUICK_FILTERS = ["Harga", "Rating", "Promo", "Terlaris", "Terbaru"];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "terlaris", label: "Terlaris" },
  { value: "terbaru", label: "Terbaru" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "harga_terendah", label: "Harga Terendah" },
  { value: "harga_tertinggi", label: "Harga Tertinggi" },
];

interface SortFilterBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeQuickFilter: string | null;
  onQuickFilterChange: (filter: string | null) => void;
}

export default function SortFilterBar({
  sort,
  onSortChange,
  activeQuickFilter,
  onQuickFilterChange,
}: SortFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-4">
      <div className="flex flex-wrap items-center gap-1 text-sm text-ink-700">
        <span className="mr-1 text-ink-400">Filter:</span>
        {QUICK_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() =>
              onQuickFilterChange(activeQuickFilter === filter ? null : filter)
            }
            className={cn(
              "rounded-pill px-2.5 py-1 font-medium transition-colors hover:text-primary-500",
              activeQuickFilter === filter && "bg-primary-50 text-primary-500"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="flex items-center gap-2 rounded-pill border border-surface-border bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:border-primary-300"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          Urutkan: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-card border border-surface-border bg-white py-1 shadow-card-hover">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "block w-full px-4 py-2 text-left text-sm hover:bg-surface-cream",
                  sort === opt.value && "font-semibold text-primary-500"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
