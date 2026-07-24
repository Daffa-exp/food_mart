import { apiClient } from "@/services/api-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export const pushNotificationService = {
  isSupported(): boolean {
    return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
  },

  async getPermissionState(): Promise<NotificationPermission | "unsupported"> {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission;
  },

  async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;
    return registration.pushManager.getSubscription();
  },

  /**
   * Alur lengkap: daftar service worker -> minta izin browser -> subscribe
   * ke PushManager pakai VAPID public key dari backend -> kirim subscription
   * itu ke backend supaya disimpan.
   *
   * PENTING: `Notification.requestPermission()` WAJIB dipanggil sebagai
   * respons langsung dari klik user (bukan otomatis saat halaman dibuka) —
   * browser modern menolak/mengabaikan permintaan izin yang tidak dipicu
   * interaksi user. Makanya fungsi ini didesain untuk dipanggil dari
   * onClick tombol, bukan dari useEffect.
   */
  async subscribe(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error("Browser ini tidak mendukung notifikasi push");
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Izin notifikasi ditolak");
    }

    const { data } = await apiClient.get("/push/vapid-public-key");
    const publicKey: string = data.data.publicKey;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = subscription.toJSON();
    await apiClient.post("/push/subscribe", {
      endpoint: json.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    });
  },

  async unsubscribe(): Promise<void> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await apiClient.post("/push/unsubscribe", { endpoint });
  },
};
