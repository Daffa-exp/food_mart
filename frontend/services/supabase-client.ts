import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Lazy singleton — client baru benar-benar dibuat saat pertama kali dipanggil
 * (di browser). Ini penting karena beberapa modul yang meng-import file ini
 * (mis. services/api-client.ts) juga dipakai dari Server Component, dan kita
 * tidak ingin membuat browser client secara tidak sengaja saat SSR.
 */
function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}

// Proxy supaya `supabase.auth.xxx()` tetap terasa seperti akses langsung,
// padahal instance sebenarnya baru dibuat saat method pertama dipanggil.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseBrowserClient();
    return Reflect.get(client, prop, client);
  },
});