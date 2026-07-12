"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Zap, ShieldCheck, HeartHandshake, Target, Eye } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";

const STATS = [
  { value: "50K+", label: "Pelanggan Aktif" },
  { value: "200+", label: "Menu Tersedia" },
  { value: "4.9★", label: "Rating Rata-rata" },
  { value: "3", label: "Tahun Beroperasi" },
];

const VALUES = [
  { icon: Leaf, title: "Bahan Segar", desc: "Setiap bahan dipilih dan diolah segar setiap hari, tanpa kompromi pada kualitas." },
  { icon: Zap, title: "Cepat & Tepat Waktu", desc: "Sistem pengiriman kami dirancang untuk sampai secepat mungkin ke pintu rumahmu." },
  { icon: ShieldCheck, title: "Aman & Terpercaya", desc: "Transaksi terenkripsi dan proses dapur yang selalu menjaga standar kebersihan." },
  { icon: HeartHandshake, title: "Berpusat pada Pelanggan", desc: "Setiap keputusan kami dimulai dari satu pertanyaan: apa yang terbaik untuk pelanggan?" },
];

export default function TentangKamiPage() {
  return (
    <>
      <Navbar />

      <div className="border-b border-surface-border bg-surface-cream">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Tentang Kami" }]} />
        </div>
      </div>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block rounded-pill bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-500">
                Tentang FoodMart
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">
                Menghadirkan Makanan Berkualitas,{" "}
                <span className="text-primary-500">Lebih Dekat ke Meja Makanmu</span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ink-700 sm:text-base">
                FoodMart lahir dari keyakinan sederhana: makanan enak dan berkualitas
                seharusnya bisa dinikmati siapa saja, kapan saja, tanpa ribet. Sejak awal
                berdiri, kami fokus membangun dapur yang bersih, tim pengiriman yang
                sigap, dan pengalaman pesan-antar yang benar-benar memudahkan.
              </p>
              <div className="mt-6">
                <Link href="/menu">
                  <Button size="lg">Jelajahi Menu Kami</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-card"
            >
              <Image
                src="https://images.unsplash.com/photo-1726992117805-6b3c5a8ebd3f?w=900&q=80"
                alt="Tim dapur FoodMart"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-surface-border bg-surface-cream">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6 lg:px-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-2xl font-extrabold text-primary-500 sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-ink-700 sm:text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-card border border-surface-border bg-white p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-900">Visi Kami</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Menjadi platform pesan-antar makanan pilihan utama yang dipercaya karena
                kualitas rasa, kecepatan layanan, dan kejujuran dalam setiap transaksi.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-card border border-surface-border bg-white p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-900">Misi Kami</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Menghadirkan menu berkualitas dengan harga wajar, memberdayakan mitra dapur
                & kurir lokal, serta terus menyederhanakan proses pemesanan lewat teknologi.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Nilai-nilai */}
        <section className="bg-surface-cream">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <h2 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Nilai yang Kami Pegang</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-700">
                Empat prinsip ini memandu setiap keputusan, dari dapur sampai ke pintu rumahmu.
              </p>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="rounded-card border border-surface-border bg-white p-5 transition-shadow hover:shadow-card-hover"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                    <v.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-ink-900">{v.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-700">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Komitmen pengiriman */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-card lg:order-1"
            >
              <Image
                src="https://images.unsplash.com/photo-1572195577046-2f25894c06fc?w=900&q=80"
                alt="Kurir FoodMart mengantar pesanan"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
                Komitmen Pengiriman Kami
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-700 sm:text-base">
                Tim kurir kami bekerja sama dengan mitra logistik terpercaya untuk memastikan
                pesananmu sampai dalam kondisi terbaik — masih hangat, kemasan rapi, dan tepat
                waktu. Estimasi pengiriman ditampilkan jelas sejak awal checkout, jadi tidak
                ada kejutan.
              </p>
              <div className="mt-6">
                <Link href="/menu">
                  <Button variant="outline" size="lg">Mulai Pesan Sekarang</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
