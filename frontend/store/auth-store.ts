"use client";

import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase-client";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  init: () => void;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,

  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, isLoading: false, isInitialized: true });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isLoading: false });
    });
  },

  signInWithPassword: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(mapAuthError(error.message));
  },

  signInWithGoogle: async () => {
    // Ini me-redirect browser ke Google, BUKAN balik nilai session langsung
    // (beda dari signInWithPassword). Sesi baru benar-benar didapat setelah
    // Google redirect balik ke /auth/callback (lihat route handler-nya).
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(mapAuthError(error.message));
  },

  signUpWithPassword: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(mapAuthError(error.message));
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },
}));

function mapAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email atau password salah",
    "User already registered": "Email sudah terdaftar, silakan masuk",
    "Email not confirmed": "Email belum diverifikasi, cek inbox kamu",
    "Password should be at least 6 characters": "Password minimal 6 karakter",
  };
  return map[message] ?? message;
}
