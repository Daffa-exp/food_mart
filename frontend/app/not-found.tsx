"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Soup, Home, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-500">
            <Soup className="h-10 w-10" />
          </span>
          <h1 className="mt-6 text-6xl font-extrabold text-primary-500">404</h1>
          <h2 className="mt-2 text-xl font-bold text-ink-900">Halaman Tidak Ditemukan</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-700">
            Sepertinya menu yang kamu cari sudah habis atau alamatnya salah.
            Yuk kembali dan cari makanan favoritmu yang lain.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button size="lg">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" size="lg">
                <Search className="h-4 w-4" /> Jelajahi Menu
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
