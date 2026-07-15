import type { Metadata } from "next";
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
