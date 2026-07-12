import Link from "next/link";
import { Soup, Mail, MapPin, Clock, MessageSquareText, Facebook, Instagram, Music2, Youtube, Twitter } from "lucide-react";

const NAVIGASI = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Kategori", href: "/menu" },
  { label: "Promo", href: "/promo" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Kontak", href: "/kontak" },
];

const BANTUAN = [
  { label: "FAQ", href: "/faq" },
  { label: "Cara Pemesanan", href: "/bantuan/cara-pemesanan" },
  { label: "Metode Pembayaran", href: "/bantuan/metode-pembayaran" },
  { label: "Status Pesanan", href: "/orders" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
];

const SOCIALS = [Facebook, Instagram, Music2, Youtube, Twitter];

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
                <Soup className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-bold leading-tight text-ink-900">FoodMart</p>
                <p className="text-[10px] font-semibold tracking-wide text-primary-500">
                  PREMIUM FOOD
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-700">
              FoodMart menyediakan makanan berkualitas dengan pengiriman cepat
              dan pembayaran yang aman.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-ink-700">
              <span className="h-2 w-2 rounded-full bg-success-500" />
              Buka Setiap Hari 10:00 – 22:00
            </div>
          </div>

          {/* Navigasi */}
          <FooterColumn title="Navigasi" links={NAVIGASI} />

          {/* Bantuan */}
          <FooterColumn title="Bantuan" links={BANTUAN} />

          {/* Hubungi Kami */}
          <div>
            <h4 className="mb-1 text-sm font-bold text-ink-900">Hubungi Kami</h4>
            <span className="mb-4 block h-0.5 w-8 bg-primary-500" />
            <ul className="space-y-3 text-sm text-ink-700">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                support@foodmart.id
              </li>
              <li className="flex items-start gap-2.5">
                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                <Link href="/chat" className="transition-colors hover:text-primary-500">
                  Live Chat
                </Link>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                Jl. Kuliner No. 12, Bandung Barat
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                Setiap Hari 10:00 – 22:00
              </li>
            </ul>
          </div>
        </div>

        {/* Socials */}
        <div className="mt-10 flex justify-center gap-3 border-t border-surface-border pt-8">
          {SOCIALS.map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-500 transition-colors hover:bg-primary-500 hover:text-white"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 text-xs text-ink-400 sm:flex-row">
          <p>© 2026 FoodMart. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/kebijakan-privasi" className="hover:text-primary-500">Kebijakan Privasi</Link>
            <Link href="/syarat-ketentuan" className="hover:text-primary-500">Syarat & Ketentuan</Link>
            <Link href="/sitemap" className="hover:text-primary-500">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-bold text-ink-900">{title}</h4>
      <span className="mb-4 block h-0.5 w-8 bg-primary-500" />
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-ink-700 transition-colors hover:text-primary-500"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
