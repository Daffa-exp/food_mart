"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/format";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
      <p className="text-xs text-ink-400">
        Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} dari {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-input border border-surface-border text-ink-700 disabled:opacity-40 hover:bg-surface-cream"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 1 || p === 1 || p === totalPages)
          .map((p, i, arr) => (
            <span key={p} className="flex items-center">
              {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-ink-400">...</span>}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  "h-8 w-8 rounded-input text-xs font-semibold",
                  p === page ? "bg-primary-500 text-white" : "text-ink-700 hover:bg-surface-cream"
                )}
              >
                {p}
              </button>
            </span>
          ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-input border border-surface-border text-ink-700 disabled:opacity-40 hover:bg-surface-cream"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
