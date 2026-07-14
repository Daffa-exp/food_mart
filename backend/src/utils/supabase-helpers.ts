/**
 * Supabase/PostgREST mengembalikan relasi embedded sebagai OBJEK TUNGGAL
 * (bukan array) ketika foreign key-nya punya unique constraint — misalnya
 * `payments.order_id` yang unique (1 order cuma boleh 1 payment). Kalau FK-nya
 * tidak unique, PostgREST membalikannya sebagai array seperti biasa.
 *
 * Kode yang menganggap bentuknya SELALU array (mis. `order.payments?.[0]`)
 * akan diam-diam gagal (selalu `undefined`) begitu PostgREST membalikan
 * objek tunggal — tanpa error yang jelas, cuma fallback ke default.
 *
 * Helper ini menormalkan kedua kemungkinan itu jadi satu bentuk konsisten.
 */
export function extractOne<T>(embedded: T | T[] | null | undefined): T | undefined {
  if (embedded == null) return undefined;
  return Array.isArray(embedded) ? embedded[0] : embedded;
}
