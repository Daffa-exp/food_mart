"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Rocket, Soup, ChevronLeft, ChevronRight } from "lucide-react";

const STATS = [
  { value: "50K+", label: "Pelanggan Aktif" },
  { value: "200+", label: "Menu Tersedia" },
  { value: "4.9★", label: "Rating Rata-rata" },
];

// 3 foto terverifikasi (burger, pizza, ayam crispy) — di-crossfade otomatis
// setiap 5 detik untuk kesan "banner autoplay halus".
const SLIDES = [
  "https://images.unsplash.com/photo-1756129725752-7b29412f20c7?w=1200&q=80",
  "https://images.unsplash.com/photo-1440637475816-2e8bf1d4b6f3?w=1200&q=80",
  "https://images.unsplash.com/photo-1657271511865-f610b280dca4?w=1200&q=80",
];

export default function AuthHeroPanel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function prevSlide() {
    setActiveSlide((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  }
  function nextSlide() {
    setActiveSlide((i) => (i + 1) % SLIDES.length);
  }

  return (
    <div className="relative hidden overflow-hidden lg:block">
      <AnimatePresence mode="sync">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[activeSlide]}
            alt="FoodMart"
            fill
            priority={activeSlide === 0}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-br from-accent-700 via-accent-500 to-accent-300 opacity-90" />

      <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
            <Soup className="h-[22px] w-[22px]" />
          </span>
          <div>
            <p className="text-lg font-bold leading-tight text-white">FoodMart</p>
            <p className="text-[10px] font-semibold tracking-wide text-white/80">PREMIUM FOOD</p>
          </div>
        </div>

        {/* Floating badges */}
        <div className="flex flex-col items-end gap-3">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2.5 text-white backdrop-blur-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <Soup className="h-4 w-4" />
            </span>
            <div className="text-xs">
              <p className="font-semibold">Classic Burger</p>
              <p className="flex items-center gap-1 text-white/80">
                <Star className="h-3 w-3 fill-white text-white" /> 4.9 · 2.4k pesanan
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2.5 text-white backdrop-blur-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <Rocket className="h-4 w-4" />
            </span>
            <div className="text-xs">
              <p className="font-semibold">Gratis Ongkir</p>
              <p className="text-white/80">Min. order Rp 50.000</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom content */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            Pengiriman Cepat & Aman
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-md text-3xl font-extrabold leading-tight text-white xl:text-4xl"
          >
            Makanan Favoritmu — Kini Lebih Dekat
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-3 max-w-sm text-sm text-white/85"
          >
            Pesan sekarang dan nikmati pengiriman kilat ke pintu rumahmu.
          </motion.p>

          <div className="mt-7 flex gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              >
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/80">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={prevSlide}
              aria-label="Sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="py-1"
                >
                  <motion.span
                    animate={{ width: i === activeSlide ? 20 : 6 }}
                    transition={{ duration: 0.3 }}
                    className={`block h-1.5 rounded-full ${i === activeSlide ? "bg-white" : "bg-white/50"}`}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={nextSlide}
              aria-label="Selanjutnya"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
