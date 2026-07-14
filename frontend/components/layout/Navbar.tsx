"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingCart, Bell, Soup, User, LogOut, Package, Menu as MenuIcon, X } from "lucide-react";
import { cn } from "@/utils/format";
import { useCartStore } from "@/store/cart-store";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useUser } from "@/hooks/useUser";
import { useWishlist, useNotifications } from "@/hooks/useAccountData";
import { useAuthStore } from "@/store/auth-store";

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Kontak", href: "/kontak" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const hasMounted = useHasMounted();
  const { user } = useUser();
  const signOut = useAuthStore((s) => s.signOut);

  const rawCartCount = useCartStore((state) => state.totalItems());
  const cartCount = hasMounted ? rawCartCount : 0;

  const { wishlistedIds } = useWishlist();
  const { unreadCount } = useNotifications();

  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  }

  const initials = user?.user_metadata?.full_name
    ? String(user.user_metadata.full_name).slice(0, 2).toUpperCase()
    : "FM";

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
            <Soup className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-bold text-ink-900">FoodMart</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-pill px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-primary-500",
                  isActive && "bg-primary-50 text-primary-500"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative ml-auto hidden max-w-sm flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Cari makanan favorit..."
            className="w-full rounded-pill border border-surface-border bg-surface-cream/60 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </form>

        {/* Icons */}
        <div className="flex items-center gap-2 sm:ml-2">
          <button
            onClick={() => setIsMobileNavOpen((o) => !o)}
            aria-label="Buka menu navigasi"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-surface-cream md:hidden"
          >
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>

          <IconBadge icon={Heart} count={hasMounted ? wishlistedIds.size : 0} href="/wishlist" label="Wishlist" />
          <IconBadge icon={ShoppingCart} count={cartCount} href="/keranjang" label="Keranjang" />
          <IconBadge icon={Bell} count={hasMounted ? unreadCount : 0} href="/notifikasi" label="Notifikasi" dot />

          {!hasMounted ? (
            <div className="ml-1 h-9 w-9 rounded-full bg-surface-cream" />
          ) : user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setIsMenuOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white"
              >
                {initials}
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-card border border-surface-border bg-white py-1.5 shadow-card-hover"
                    >
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-cream">
                        <User className="h-4 w-4" /> Profil Saya
                      </Link>
                      <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-cream">
                        <Package className="h-4 w-4" /> Pesanan Saya
                      </Link>
                      <button
                        onClick={() => { signOut(); setIsMenuOpen(false); router.push("/"); }}
                        className="flex w-full items-center gap-2.5 border-t border-surface-border px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Keluar
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 flex items-center gap-1.5 rounded-pill bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-surface-border bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              <form onSubmit={handleSearchSubmit} className="relative mb-2">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Cari makanan favorit..."
                  className="w-full rounded-pill border border-surface-border bg-surface-cream/60 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                />
              </form>
              {NAV_LINKS.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "block rounded-input px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-cream",
                      isActive && "bg-primary-50 text-primary-500"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconBadge({
  icon: Icon,
  count,
  href,
  label,
  dot = false,
}: {
  icon: typeof Heart;
  count: number;
  href: string;
  label: string;
  dot?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-surface-cream hover:text-primary-500"
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {count > 0 && (
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
            dot ? "bg-success-500" : "bg-primary-500"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}