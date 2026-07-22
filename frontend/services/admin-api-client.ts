import axios from "axios";
import { supabaseAdminClient } from "@/services/supabase-admin-client";

export const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Sama seperti interceptor di api-client.ts, tapi ambil token dari sesi
// ADMIN (supabaseAdminClient), bukan sesi customer — supaya semua request
// Admin Panel diautentikasi pakai identitas admin yang login di
// /admin/login, independen dari sesi customer di tab yang sama.
adminApiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;

  const { data } = await supabaseAdminClient.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? "Terjadi kesalahan, silakan coba lagi";
    return Promise.reject(new Error(message));
  }
);
