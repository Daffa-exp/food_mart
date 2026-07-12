"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const TESTIMONIALS = [
  {
    name: "Farhan Maulana",
    role: "Pelanggan Setia",
    quote: "Makanannya selalu datang panas dan tepat waktu. Rasanya konsisten enak setiap pesan.",
    rating: 5,
  },
  {
    name: "Dinda Ayu Lestari",
    role: "Food Enthusiast",
    quote: "Pilihan menunya lengkap dan harganya bersahabat. Favorit saya Classic Smash Burger!",
    rating: 5,
  },
  {
    name: "Rizky Pratama",
    role: "Pelanggan Baru",
    quote: "Proses order gampang banget, pembayarannya juga banyak pilihan. Pengiriman cepat pula.",
    rating: 4,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        title="Testimoni Pelanggan"
        subtitle="Apa kata mereka yang sudah mencoba layanan FoodMart"
      />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="rounded-card bg-primary-500 p-6 text-white"
          >
            <Quote className="h-6 w-6 text-white/60" />
            <p className="mt-3 text-sm leading-relaxed text-white/95">“{t.quote}”</p>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-white/75">{t.role}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-3.5 w-3.5 ${
                      idx < t.rating ? "fill-white text-white" : "text-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
