import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/services/supabase-server";

/**
 * Setelah user login lewat Google, Supabase redirect balik ke sini
 * (`/auth/callback?code=...`) — bukan langsung ke halaman tujuan. Tugas
 * route ini cuma satu: tukar `code` itu dengan sesi login beneran (dan
 * simpan sebagai cookie), baru redirect ke halaman yang dituju.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] Gagal menukar code jadi sesi:", error.message);
  }

  // Gagal (code tidak ada / tidak valid) — balik ke halaman login dengan
  // pesan error, daripada diam-diam redirect ke home seolah berhasil.
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
