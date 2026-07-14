import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase khusus dipakai di server (Route Handler / Server Action),
 * BUKAN di komponen client biasa (pakai `services/supabase-client.ts` untuk
 * itu). Bedanya: client ini baca & tulis cookie session lewat Next.js
 * `cookies()`, supaya sesi hasil login (termasuk login Google) benar-benar
 * tersimpan di cookie browser, bukan cuma di memory.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Bisa dipanggil dari Server Component (bukan Route Handler),
            // yang tidak boleh set cookie — aman diabaikan karena middleware
            // akan menyegarkan sesi di request berikutnya.
          }
        },
      },
    }
  );
}
