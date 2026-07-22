"use client";

import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";

function AuthInitializer() {
  const init = useAuthStore((s) => s.init);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (!isInitialized) init();
  }, [isInitialized, init]);

  return null;
}

// PENTING: query key seperti ["notifications"], ["wishlist"], dsb TIDAK
// menyertakan user id di dalamnya. React Query menganggap itu query yang
// SAMA persis siapa pun usernya, jadi begitu ganti akun (logout lalu login
// akun lain, TANPA reload penuh halaman), data cache milik user LAMA
// langsung ditampilkan dulu (sebelum sempat refetch) — user baru sempat
// lihat notifikasi/wishlist orang lain selama beberapa saat. Komponen ini
// mengosongkan seluruh cache setiap kali authId berubah (termasuk saat
// logout ke null), supaya tidak ada data nyasar antar akun.
function QueryCacheResetOnAuthChange({ queryClient }: { queryClient: QueryClient }) {
  const authId = useAuthStore((s) => s.user?.id ?? null);
  const previousAuthId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Lewati sekali di awal (initial mount) — cache memang masih kosong,
    // tidak perlu di-clear, cukup mulai "mengingat" authId saat ini.
    if (previousAuthId.current === undefined) {
      previousAuthId.current = authId;
      return;
    }
    if (previousAuthId.current !== authId) {
      queryClient.clear();
      previousAuthId.current = authId;
    }
  }, [authId, queryClient]);

  return null;
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <QueryCacheResetOnAuthChange queryClient={queryClient} />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#1F2937",
            color: "#fff",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#F5821F", secondary: "#fff" } },
        }}
      />
    </QueryClientProvider>
  );
}
