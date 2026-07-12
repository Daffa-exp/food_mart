import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Reserved untuk verifikasi JWT lokal (lebih cepat, tanpa round-trip ke
  // Supabase Auth API) — belum dipakai di auth.middleware.ts saat ini,
  // yang masih memvalidasi token lewat supabaseAdmin.auth.getUser().
  SUPABASE_JWT_SECRET: z.string().optional(),

  MIDTRANS_SERVER_KEY: z.string().min(1),
  MIDTRANS_CLIENT_KEY: z.string().min(1),
  MIDTRANS_IS_PRODUCTION: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX: z.string().default("100"),

  SUPABASE_STORAGE_BUCKET: z.string().default("public-images"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Environment variable tidak valid:", parsed.error.flatten().fieldErrors);
  // Tidak exit di build-time, hanya warning saat development scaffold.
}

export const env = parsed.success
  ? parsed.data
  : (process.env as unknown as z.infer<typeof envSchema>);
