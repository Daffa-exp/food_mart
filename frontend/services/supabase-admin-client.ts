import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let adminBrowserClient: SupabaseClient | null = null;

/**
 * PENTING: client Supabase TERPISAH khusus Admin Panel, dengan
 * `storageKey` yang beda dari client customer (services/supabase-client.ts).
 *
 * Sebelumnya Admin Panel memakai client yang SAMA PERSIS dengan sisi
 * customer — artinya cuma ada SATU sesi login per browser. Begitu admin
 * login lewat /admin/login, sesi itu otomatis "menimpa" sesi customer di
 * tab/browser yang sama (Navbar customer ikut menampilkan akun admin
 * tersebut sebagai user yang login, keranjang/notifikasi ikut tercampur).
 *
 * Dengan storageKey berbeda, Supabase menyimpan token admin & customer di
 * slot localStorage yang berbeda — login/logout di satu sisi TIDAK
 * memengaruhi sesi di sisi lainnya, walau dibuka di browser yang sama.
 */
function getSupabaseAdminBrowserClient(): SupabaseClient {
  if (!adminBrowserClient) {
    adminBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: "foodmart-admin-auth",
        },
      }
    );
  }
  return adminBrowserClient;
}

export const supabaseAdminClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdminBrowserClient();
    return Reflect.get(client, prop, client);
  },
});
