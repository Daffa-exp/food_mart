import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Service role client — hanya dipakai di server, TIDAK PERNAH dikirim ke client.
// RLS tetap aktif di level database; service role dipakai untuk operasi
// admin/backend yang butuh bypass RLS secara terkontrol (mis. update status
// order dari webhook Midtrans).
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
