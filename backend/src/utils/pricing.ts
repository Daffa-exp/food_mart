import { supabaseAdmin } from "../config/supabase";

// Nilai fallback (dipakai hanya kalau baris di tabel `settings` belum ada
// atau query ke database gagal) — supaya checkout tidak pernah error hanya
// karena setting kosong. Nilai normal sehari-hari selalu diambil dari
// tabel `settings`, yang diatur admin lewat Admin Panel > Pengaturan.
export const DEFAULT_SHIPPING_FEE: Record<"instant" | "same_day" | "regular", number> = {
  instant: 15000,
  same_day: 10000,
  regular: 5000,
};
export const DEFAULT_FREE_SHIPPING_MIN_PURCHASE = 50000;
export const DEFAULT_SERVICE_FEE = 2000;

export interface PricingSettings {
  shippingFee: Record<"instant" | "same_day" | "regular", number>;
  freeShippingMinPurchase: number;
  serviceFee: number;
}

interface ShippingFeeSettingRow {
  instant?: number;
  same_day?: number;
  regular?: number;
  free_shipping_min?: number;
}

interface ServiceFeeSettingRow {
  amount?: number;
}

/**
 * Ambil ongkir & biaya layanan yang berlaku SAAT INI dari tabel `settings`
 * (diisi lewat Admin Panel > Pengaturan, key `shipping_fee` & `service_fee`).
 * Kalau baris belum ada atau query gagal, jatuh ke nilai default di atas
 * supaya proses checkout tetap berjalan.
 */
export async function getPricingSettings(): Promise<PricingSettings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", ["shipping_fee", "service_fee"]);

  if (error || !data) {
    return {
      shippingFee: DEFAULT_SHIPPING_FEE,
      freeShippingMinPurchase: DEFAULT_FREE_SHIPPING_MIN_PURCHASE,
      serviceFee: DEFAULT_SERVICE_FEE,
    };
  }

  const shippingRow = data.find((r) => r.key === "shipping_fee")?.value as ShippingFeeSettingRow | undefined;
  const serviceRow = data.find((r) => r.key === "service_fee")?.value as ServiceFeeSettingRow | undefined;

  return {
    shippingFee: {
      instant: shippingRow?.instant ?? DEFAULT_SHIPPING_FEE.instant,
      same_day: shippingRow?.same_day ?? DEFAULT_SHIPPING_FEE.same_day,
      regular: shippingRow?.regular ?? DEFAULT_SHIPPING_FEE.regular,
    },
    freeShippingMinPurchase: shippingRow?.free_shipping_min ?? DEFAULT_FREE_SHIPPING_MIN_PURCHASE,
    serviceFee: serviceRow?.amount ?? DEFAULT_SERVICE_FEE,
  };
}

export function calculateShippingFeeFromSettings(
  pricing: PricingSettings,
  deliveryMethod: "instant" | "same_day" | "regular",
  subtotal: number
): number {
  if (subtotal >= pricing.freeShippingMinPurchase) return 0;
  return pricing.shippingFee[deliveryMethod];
}
