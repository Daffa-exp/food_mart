"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useBanners } from "@/hooks/useProducts";

const AUTO_SLIDE_MS = 5000;

export default function PromoBanner() {
  const { data: rawBanners, isLoading, isError } = useBanners();

  // PENTING: banner tanpa gambar tidak berguna untuk ditampilkan, dan
  // <Image src> Next.js menolak nilai `null` secara ketat (ini yang bikin
  // build Vercel gagal: "Type 'string | null' is not assignable to type
  // 'string | StaticImport'"). Filter di sini sekaligus menyingkirkan data
  // banner yang gambarnya kosong DAN memastikan TypeScript tahu imageUrl
  // pasti string (bukan null) untuk banner yang tersisa.
  const banners = (rawBanners ?? []).filter(
    (b): b is typeof b & { imageUrl: string } => !!b.imageUrl
  );
  const [active, setActive] = useState(0);

  const count = banners.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  // Auto-geser tiap beberapa detik selagi ada lebih dari 1 banner.
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => setActive((prev) => (prev + 1) % count), AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [count]);

  // Kalau daftar banner berubah (mis. baru selesai fetch), pastikan index tetap valid.
  useEffect(() => {
    if (active >= count) setActive(0);
  }, [count, active]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-56 animate-pulse rounded-card bg-surface-cream sm:h-64" />
      </section>
    );
  }

  if (isError || banners.length === 0) {
    return null;
  }

  const banner = banners[active];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="group relative h-56 overflow-hidden rounded-card sm:h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title ?? "Banner promo"}
              fill
              className="object-cover"
              unoptimized
              priority={active === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-ink-900/40 to-transparent" />
            {banner.title && (
              <div className="relative flex h-full flex-col justify-center gap-3 px-6 sm:px-10">
                <span className="w-fit rounded-pill bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                  Promo
                </span>
                <h3 className="max-w-sm text-xl font-bold text-white sm:text-2xl">
                  {banner.title}
                </h3>
                <Link href={banner.linkUrl || "/menu"} className="w-fit">
                  <Button variant="white" size="sm">
                    Lihat Promo
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Banner sebelumnya"
              onClick={() => goTo(active - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink-900 opacity-0 transition hover:bg-white group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Banner selanjutnya"
              onClick={() => goTo(active + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink-900 opacity-0 transition hover:bg-white group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Ke banner ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-pill transition-all ${
                    i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
