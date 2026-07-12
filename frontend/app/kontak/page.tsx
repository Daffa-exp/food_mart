"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquareText, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";

export default function KontakPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Kontak" }]}
        title="Customer Support"
        subtitle="Tim kami siap membantu pertanyaan seputar produk maupun pesananmu"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Info kontak */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3 lg:col-span-2"
          >
            <ContactInfoCard icon={Mail} label="Email" value="support@foodmart.id" />
            <ContactInfoCard icon={MapPin} label="Alamat" value="Jl. Kuliner No. 12, Bandung Barat" />
            <ContactInfoCard icon={Clock} label="Jam Operasional" value="Setiap Hari 10:00 – 22:00" />
          </motion.div>

          {/* Live Chat CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col justify-center rounded-card border border-surface-border bg-white p-6 lg:col-span-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50 text-success-500">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink-900">Live Chat</h2>
                <p className="text-xs text-ink-700">Respon tercepat, langsung terhubung dengan tim support kami</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink-700">
              Punya pertanyaan tentang produk, status pesanan, atau kendala lainnya?
              Mulai percakapan dengan tim Customer Support kami melalui Live Chat —
              tidak perlu aplikasi tambahan.
            </p>

            <Link href="/chat?type=support" className="mt-5">
              <Button fullWidth size="lg">
                Mulai Live Chat
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function ContactInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-surface-border bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className="text-sm font-medium text-ink-900">{value}</p>
      </div>
    </div>
  );
}
