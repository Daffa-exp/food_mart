import webpush from "web-push";
import { env } from "../config/env";
import { pushSubscriptionRepository } from "../repositories/push-subscription.repository";

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn(
      "[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY belum di-set — notifikasi push dilewati (fitur nonaktif, sisanya tetap jalan normal)."
    );
    return;
  }
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  isConfigured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string; // halaman yang dibuka kalau notifikasi diklik
  icon?: string;
}

export const pushService = {
  /**
   * Kirim push notification ke SEMUA device milik satu user (bisa lebih
   * dari satu kalau dia login di beberapa browser/HP). Dipanggil dari
   * notificationRepository.create() — gagal kirim push TIDAK BOLEH bikin
   * notifikasi in-app gagal tersimpan, makanya semua error di sini cuma
   * di-log, tidak di-throw ke pemanggil.
   */
  async sendToUser(userId: string, payload: PushPayload) {
    ensureConfigured();
    if (!isConfigured) return;

    const subs = await pushSubscriptionRepository.listByUserId(userId);
    await Promise.all(subs.map((sub) => this.sendToSubscription(sub, payload)));
  },

  async sendToAll(payload: PushPayload) {
    ensureConfigured();
    if (!isConfigured) return;

    const subs = await pushSubscriptionRepository.listAll();
    await Promise.all(subs.map((sub) => this.sendToSubscription(sub, payload)));
  },

  async sendToSubscription(
    sub: { endpoint: string; p256dh: string; auth: string },
    payload: PushPayload
  ) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      // 404/410 = subscription sudah tidak valid (user uninstall/block
      // notifikasi/clear data browser) — bersihkan dari database supaya
      // tidak terus dicoba kirim ke endpoint yang mati.
      if (statusCode === 404 || statusCode === 410) {
        await pushSubscriptionRepository.remove(sub.endpoint);
      } else {
        console.error("[push] Gagal mengirim notifikasi:", err);
      }
    }
  },
};
