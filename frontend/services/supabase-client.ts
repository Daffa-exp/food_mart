import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let adminBrowserClient: SupabaseClient | null = null;

/**
 * PENTING: client Supabase TERPISAH khusus Admin Panel, dengan penyimpanan
 * sesi yang beda dari client customer (services/supabase-client.ts).
 *
 * CATATAN PERBAIKAN (percobaan sebelumnya gagal 2x):
 * 1. Percobaan pertama pakai `createBrowserClient` dari `@supabase/ssr`
 *    dengan opsi `auth.storageKey` — diabaikan, karena paket itu menyimpan
 *    sesi lewat cookie, bukan lewat opsi itu.
 * 2. Percobaan kedua ganti ke `cookieOptions.name` di `@supabase/ssr` —
 *    seharusnya benar, tapi paket `@supabase/ssr` didesain buat skenario
 *    SSR (baca sesi dari cookie di Server Component/middleware), yang
 *    SAMA SEKALI TIDAK DIPAKAI di Admin Panel ini (AdminGuard 100%
 *    client-side, tidak ada Server Component yang baca sesi admin).
 *
 * Solusi paling aman: pakai `createClient` POLOS dari `@supabase/supabase-js`
 * (bukan `@supabase/ssr`) — paket inti yang opsi `auth.storageKey`-nya resmi
 * didukung dan dipakai langsung untuk menentukan key localStorage, tanpa
 * lapisan cookie tambahan yang bisa salah konfigurasi. Ini cukup untuk
 * Admin Panel karena semuanya client-side.
 */
function getSupabaseAdminBrowserClient(): SupabaseClient {
  if (!adminBrowserClient) {
    adminBrowserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: "sb-foodmart-admin-auth",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return adminBrowserClient;
}

// Proxy supaya `supabaseAdminClient.auth.xxx()` tetap terasa seperti akses
// langsung, padahal instance sebenarnya baru dibuat saat method pertama
// dipanggil (lazy, aman dari isu SSR).
export const supabaseAdminClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminBrowserClient();
    return Reflect.get(client, prop, client);
  },
});