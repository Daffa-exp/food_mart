"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { pushNotificationService } from "@/services/push-notification.service";

export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    (async () => {
      const supported = pushNotificationService.isSupported();
      setIsSupported(supported);
      if (supported) {
        const sub = await pushNotificationService.getCurrentSubscription();
        setIsSubscribed(!!sub);
      }
      setIsLoading(false);
    })();
  }, []);

  async function handleToggle() {
    setIsToggling(true);
    try {
      if (isSubscribed) {
        await pushNotificationService.unsubscribe();
        setIsSubscribed(false);
        toast.success("Notifikasi push dinonaktifkan");
      } else {
        await pushNotificationService.subscribe();
        setIsSubscribed(true);
        toast.success("Notifikasi push diaktifkan! Coba pesan sesuatu buat lihat notifnya 🔔");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah pengaturan notifikasi");
    } finally {
      setIsToggling(false);
    }
  }

  if (!isSupported) return null; // browser lama / iOS Safari versi lama tidak dukung Web Push

  return (
    <div className="flex items-center justify-between rounded-card border border-surface-border bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
          {isSubscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </span>
        <div>
          <p className="text-sm font-bold text-ink-900">Notifikasi Push</p>
          <p className="text-xs text-ink-700">
            Dapatkan notifikasi langsung ke perangkat ini walau tab/aplikasi tertutup — update pesanan,
            promo, dan balasan chat.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-ink-400" />
      ) : (
        <button
          onClick={handleToggle}
          disabled={isToggling}
          aria-label={isSubscribed ? "Matikan notifikasi push" : "Aktifkan notifikasi push"}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            isSubscribed ? "bg-primary-500" : "bg-surface-cream"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              isSubscribed ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      )}
    </div>
  );
}
