"use client";

import { motion } from "framer-motion";
import { Leaf, Zap, ShieldCheck, HeartHandshake } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const FEATURES = [
  {
    icon: Leaf,
    title: "Bahan Segar",
    description: "Setiap bahan dipilih dan diolah segar setiap hari untuk kualitas rasa terbaik.",
  },
  {
    icon: Zap,
    title: "Pengiriman Cepat",
    description: "Pesananmu sampai dalam hitungan menit dengan armada pengiriman kami.",
  },
  {
    icon: ShieldCheck,
    title: "Pembayaran Aman",
    description: "Transaksi terenkripsi dan didukung berbagai metode pembayaran terpercaya.",
  },
  {
    icon: HeartHandshake,
    title: "Pelayanan Terbaik",
    description: "Tim kami siap membantu kapan pun kamu butuhkan, setiap hari.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="bg-surface-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          title="Kenapa Memilih Kami"
          subtitle="Komitmen kami untuk memberikan pengalaman pemesanan terbaik bagimu"
        />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-card border border-surface-border bg-white p-5 shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                <f.icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-sm font-bold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-700">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
