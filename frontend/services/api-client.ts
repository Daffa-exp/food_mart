import axios from "axios";
import { supabase } from "@/services/supabase-client";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Menyisipkan Supabase access token ke setiap request (kalau user login),
// supaya backend bisa mengenali user lewat requireAuth/optionalAuth.
// GUARD: apiClient ini juga dipakai dari Server Component (mis. halaman
// Payment Success mengambil data order saat SSR) — Supabase browser client
// TIDAK aman dipanggil di server (butuh `document` untuk cookie storage),
// jadi lewati penyisipan token kalau sedang berjalan di server. Endpoint
// yang butuh auth ketat (requireAuth) akan otomatis menolak dengan 401
// yang jelas, sedangkan endpoint publik/optionalAuth tetap berfungsi normal.
apiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? "Terjadi kesalahan, silakan coba lagi";
    return Promise.reject(new Error(message));
  }
);
