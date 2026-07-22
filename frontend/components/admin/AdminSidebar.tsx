"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Package, FolderTree, Users, Star,
  Tag, Ticket, Boxes, FileBarChart, CreditCard, Settings, UserCog, Soup, ShieldCheck,
  MessageSquareText, X,
} from "lucide-react";
import { cn } from "@/utils/format";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Live Chat", href: "/admin/chat", icon: MessageSquareText },
  { label: "Promotions", href: "/admin/promotions", icon: Tag },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Banners", href: "/admin/banners", icon: FolderTree },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "Payment History", href: "/admin/payments", icon: CreditCard },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Admin Profile", href: "/admin/profile", icon: UserCog },
  { label: "Admin Management", href: "/admin/admins", icon: ShieldCheck },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
          <Soup className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight text-ink-900">FoodMart</p>
          <p className="text-[10px] font-semibold text-primary-500">ADMIN PANEL</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.025 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-input px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-500"
                    : "text-ink-700 hover:bg-surface-cream"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </>
  );
}

// Sidebar admin punya 2 wujud:
// 1. Desktop (lg ke atas): sidebar statis, selalu kelihatan di kiri.
// 2. Mobile/tablet (di bawah lg): SEBELUMNYA cuma "hidden" tanpa pengganti
//    apa pun, jadi seluruh navigasi admin hilang total di HP. Sekarang jadi
//    drawer yang dibuka lewat tombol hamburger di AdminTopbar (lihat prop
//    isMobileOpen/onClose yang dikontrol dari sana).
export default function AdminSidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-surface-border bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-white shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-end px-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700 hover:bg-surface-cream"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
