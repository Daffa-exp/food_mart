// Metadata tampilan metode pengiriman (label, durasi, ikon). Nilai ongkir
// (fee) TIDAK disimpan di sini lagi — diambil live dari backend lewat
// usePricingSettings(), supaya selalu sinkron dengan Admin Panel > Settings
// dan dengan angka yang benar-benar dipakai backend saat order dibuat.
export const DELIVERY_OPTIONS = [
  { value: "instant" as const, label: "Instant Delivery", duration: "20–30 Menit" },
  { value: "same_day" as const, label: "Same Day Delivery", duration: "1–3 Jam" },
  { value: "regular" as const, label: "Regular Delivery", duration: "4 Jam" },
];
