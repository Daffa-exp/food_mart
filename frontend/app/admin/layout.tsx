"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAdminProfile } from "@/hooks/useAdmin";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) return <>{children}</>;
  return <AdminGuard>{children}</AdminGuard>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const user = useAdminAuthStore((s) => s.user);
  const isUserLoading = useAdminAuthStore((s) => s.isLoading);
  const isInitialized = useAdminAuthStore((s) => s.isInitialized);
  const init = useAdminAuthStore((s) => s.init);
  const { data: admin, isLoading: isAdminLoading, isError } = useAdminProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Store admin punya sesi Supabase sendiri (lihat store/admin-auth-store.ts),
  // jadi perlu di-init sendiri di sini — TIDAK di-init otomatis oleh
  // AppProviders global (itu cuma untuk sesi customer).
  useEffect(() => {
    if (!isInitialized) init();
  }, [isInitialized, init]);

  const isLoading = !hasMounted || isUserLoading || (!!user && isAdminLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!user || isError) {
      router.replace("/admin/login");
    }
  }, [isLoading, user, isError, router]);

  // Tutup drawer otomatis tiap pindah halaman (mis. setelah klik menu),
  // supaya tidak nyangkut kebuka pas sudah ganti halaman.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    // PENTING soal overflow di HP: flexbox secara default punya
    // "min-width: auto" pada anak-anaknya, artinya elemen sebelah kanan
    // (main) menolak menyusut lebih kecil dari lebar konten terlebarnya
    // (misal tabel/baris filter yang panjang) — akibatnya SELURUH halaman
    // (bukan cuma tabelnya) ikut melebar ke samping dan memicu geser
    // horizontal, walau tabel individual sudah dibungkus overflow-x-auto.
    // "min-w-0" di sini memaksa area konten boleh menyusut sesuai lebar
    // layar HP, sehingga overflow-x-auto pada tabel di dalamnya baru bisa
    // benar-benar berfungsi sebagai pembatas. Ini berlaku untuk SEMUA
    // halaman admin sekaligus karena diterapkan di layout bersama, bukan
    // per halaman.
    <div className="flex min-h-screen bg-surface-cream">
      <AdminSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar admin={admin} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
