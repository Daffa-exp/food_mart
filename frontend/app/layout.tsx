import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/app-providers";
import FloatingScrollTop from "@/components/ui/FloatingScrollTop";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FoodMart — Makanan Favoritmu, Kini Lebih Dekat",
  description:
    "FoodMart menyediakan makanan berkualitas dengan pengiriman cepat dan pembayaran yang aman.",
};

// PENTING: tanpa ini, project SAMA SEKALI tidak punya viewport meta tag.
// Akibatnya browser HP menganggap halaman didesain untuk layar desktop
// (~980px) dan otomatis di-zoom-out biar "muat" — inilah penyebab utama
// tampilan di HP kelihatan kecil/ter-zoom dan harus digeser-geser. Ini
// beda dari sekadar CSS responsive yang kurang rapi; tanpa baris ini,
// class Tailwind sm:/md:/lg: pun tidak dievaluasi dengan benar karena
// browser tidak tahu lebar layar HP yang sebenarnya.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // tetap izinkan user pinch-zoom manual kalau perlu, jangan dikunci total
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={fontSans.variable}>
      <body className="overflow-x-hidden">
        <AppProviders>{children}</AppProviders>
        <FloatingScrollTop />
      </body>
    </html>
  );
}
