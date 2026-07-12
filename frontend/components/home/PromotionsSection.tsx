"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { usePromotions } from "@/hooks/useProducts";

export default function PromotionsSection() {
  const { data: promotions, isLoading, isError } = usePromotions();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Sembunyikan section sepenuhnya kalau tidak ada promosi aktif — daripada
  // menampilkan section kosong yang janggal di homepage.
  if (!isLoading && (isError || !promotions || promotions.length === 0)) {
    return null;
  }

  function scrollByCard(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-promo-card]")?.clientWidth ?? 300;
    el.scrollBy({ left: direction === "left" ? -(cardWidth + 16) : cardWidth + 16, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading
        title="Promo Spesial"
        subtitle="Jangan sampai kelewatan, promo ini berlaku terbatas"
      />

      {isLoading && (
        <div className="scrollbar-hide mt-6 flex gap-4 overflow-x-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 w-[280px] shrink-0 animate-pulse rounded-card bg-surface-cream sm:w-[320px]" />
          ))}
        </div>
      )}

      {promotions && promotions.length > 0 && (
        <div className="relative mt-6">
          {promotions.length > 3 && (
            <>
              <button
                onClick={() => scrollByCard("left")}
                aria-label="Geser ke kiri"
                className="absolute -left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-surface-border bg-white text-ink-700 shadow-md transition-colors hover:border-primary-300 hover:text-primary-500 sm:flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollByCard("right")}
                aria-label="Geser ke kanan"
                className="absolute -right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-surface-border bg-white text-ink-700 shadow-md transition-colors hover:border-primary-300 hover:text-primary-500 sm:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <div
            ref={scrollerRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          >
            {promotions.map((promo) => (
              <motion.div
                key={promo.id}
                data-promo-card
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-surface-cream bg-white shadow-sm sm:w-[320px]"
              >
                <div className="relative h-40 w-full bg-surface-cream">
                  {promo.bannerImageUrl && (
                    <Image
                      src={promo.bannerImageUrl}
                      alt={promo.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {promo.discountPercentage && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-pill bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                      <Tag className="h-3 w-3" />
                      Diskon {promo.discountPercentage}%
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="font-bold text-ink-900">{promo.title}</h3>
                  {promo.description && (
                    <p className="line-clamp-2 text-sm text-ink-700">{promo.description}</p>
                  )}
                  <p className="text-xs text-ink-400">
                    Berlaku hingga{" "}
                    {new Date(promo.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <Link
                    href={promo.productSlug ? `/menu/${promo.productSlug}` : "/menu"}
                    className="mt-auto"
                  >
                    <Button variant="outline" size="sm" fullWidth>
                      {promo.productSlug ? `Lihat ${promo.productName}` : "Lihat Promo"}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
