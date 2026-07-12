"use client";

import { BellOff, ShoppingBag, Tag, Info, CreditCard, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import RequireAuth from "@/components/auth/RequireAuth";
import { cn } from "@/utils/format";
import { useNotifications } from "@/hooks/useAccountData";
import { Notification } from "@/types/entities";

const TYPE_ICON: Record<Notification["type"], typeof ShoppingBag> = {
  order: ShoppingBag,
  promotion: Tag,
  system: Info,
  payment: CreditCard,
  review: Star,
};

export default function NotificationsPage() {
  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Notifikasi" }]}
        title="Notifikasi"
        subtitle="Update terbaru seputar pesanan dan promo untukmu"
      />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <RequireAuth message="Masuk untuk melihat notifikasi kamu">
          <NotificationList />
        </RequireAuth>
      </main>

      <Footer />
    </>
  );
}

function NotificationList() {
  const { data: notifications, isLoading, isError, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-card bg-surface-cream" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="py-10 text-center text-sm text-red-500">Gagal memuat notifikasi.</p>;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-surface-border py-20 text-center">
        <BellOff className="h-10 w-10 text-ink-400" />
        <div>
          <p className="font-medium text-ink-900">Belum ada notifikasi</p>
          <p className="text-sm text-ink-700">Notifikasi pesanan & promo akan muncul di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-ink-700">{unreadCount} notifikasi belum dibaca</span>
          <button
            onClick={() => markAllAsRead()}
            className="text-xs font-semibold text-primary-500 hover:underline"
          >
            Tandai semua dibaca
          </button>
        </div>
      )}
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = TYPE_ICON[n.type];
          return (
            <button
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-card border p-4 text-left transition-colors",
                n.isRead ? "border-surface-border bg-white" : "border-primary-200 bg-primary-50/40"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                  {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                </div>
                <p className="mt-0.5 text-sm text-ink-700">{n.message}</p>
                <p className="mt-1.5 text-xs text-ink-400">
                  {new Date(n.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
