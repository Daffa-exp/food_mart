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
//
// PENTING: `getSession()` dibungkus timeout 3 detik. TANPA ini, kalau proses
// cek/refresh sesi ke server Supabase kebetulan lambat atau macet (mis. pas
// pertama kali halaman dibuka, token lama butuh di-refresh), maka SEMUA
// request ikut nyangkut TANPA BATAS WAKTU — termasuk request data publik
// (produk, promosi, kategori) yang sebenarnya sama sekali tidak butuh token.
// Gejalanya: halaman kelihatan "gak pernah selesai loading" kalau ditunggu,
// tapi begitu ada navigasi baru (sesi sudah kepake/selesai duluan di
// request lain), request berikutnya langsung lancar. Dengan timeout ini,
// kalau cek sesi lebih dari 3 detik, request tetap jalan TANPA token
// (aman untuk endpoint publik; endpoint yang benar-benar butuh login akan
// tetap ditolak 401 secara jelas oleh backend, bukan menggantung diam-diam).
function getSessionWithTimeout(ms: number) {
  return Promise.race([
    supabase.auth.getSession(),
    new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), ms)
    ),
  ]);
}

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  const { data } = await getSessionWithTimeout(3000);
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