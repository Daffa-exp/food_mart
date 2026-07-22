"use client";

import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { supabaseAdminClient } from "@/services/supabase-admin-client";

interface AdminAuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  init: () => void;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,

  init: () => {
    supabaseAdminClient.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, isLoading: false, isInitialized: true });
    });

    supabaseAdminClient.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isLoading: false });
    });
  },

  signInWithPassword: async (email, password) => {
    const { error } = await supabaseAdminClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error(mapAuthError(error.message));
  },

  signOut: async () => {
    await supabaseAdminClient.auth.signOut();
  },
}));

function mapAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email atau password salah",
    "Email not confirmed": "Email belum diverifikasi, cek inbox kamu",
  };
  return map[message] ?? message;
}
