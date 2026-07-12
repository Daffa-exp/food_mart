"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";

const STATS = [
  { value: "50K+", label: "Pelanggan Aktif" },
  { value: "200+", label: "Menu Tersedia" },
  { value: "4.9★", label: "Rating Rata-rata" },
];

const HERO_VIDEO_SRC = "/videos/hero-loop.mp4";
const HERO_POSTER_SRC = "/videos/hero-poster.jpg";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  // React kadang telat/gagal nge-set attribute `muted` di DOM sebelum browser
  // mengevaluasi izin autoplay, jadi video jadi tidak jalan sama sekali
  // (browser diam-diam menolak autoplay yang dianggap "belum tentu muted").
  // Set eksplisit lewat ref + panggil play() manual sebagai jaring pengaman.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    video.muted = true;
    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => setVideoFailed(true));
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink-900">
      {/* Video latar — muted & loop supaya autoplay diizinkan browser di semua
          perangkat. object-cover biar selalu penuh tanpa distorsi rasio. */}
      {!videoFailed && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
        />
      )}
      {/* Fallback kalau video gagal dimuat (mis. file belum diupload) —
          tetap tampil sebagai foto latar, jangan sampai section jadi kosong. */}
      {videoFailed && (
        <Image
          src={HERO_POSTER_SRC}
          alt=""
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlay gelap ala gradient supaya teks putih tetap kebaca di atas
          video, sekaligus jangan sampai video "hilang" total (masih terlihat
          jelas di sisi kanan). */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/60 to-ink-900/20" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Makanan Favoritmu
            <br />
            <span className="text-primary-400">Kini Lebih Dekat</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            Pesan sekarang dan nikmati pengiriman kilat ke pintu rumahmu,
            dengan ratusan pilihan menu berkualitas setiap hari.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/menu">
              <Button variant="primary" size="lg">
                Lihat Menu
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Pesan Sekarang
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              >
                <p className="text-xl font-extrabold text-white sm:text-2xl">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Image card — tetap dipertahankan sebagai aksen mengambang di atas
            video, bukan diganti, supaya produk unggulan tetap jadi fokus. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <div className="absolute inset-6 rounded-full bg-white/10 backdrop-blur-sm" />
          <div className="relative h-full w-full overflow-hidden rounded-[32px] shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80"
              alt="Classic Smash Burger Double Patty"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="absolute left-3 top-3 rounded-pill bg-success-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
            Diskon 25%
          </span>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-pill bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
            <Star className="h-4 w-4 fill-primary-500 text-primary-500" />
            <span className="text-xs font-semibold text-ink-900">
              Classic Smash Burger · 4.8
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
