"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { useUser } from "@/hooks/useUser";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAdminProfile } from "@/hooks/useAdmin";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) return <>{children}</>;
  return <AdminGuard>{children}</AdminGuard>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const { user, isLoading: isUserLoading } = useUser();
  const { data: admin, isLoading: isAdminLoading, isError } = useAdminProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
    // min-w-0 di sini tetap dipertahankan — ini fix overflow di HP untuk
    // SEMUA halaman admin (tidak terkait sesi login, jadi aman dibiarkan).
    <div className="flex min-h-screen bg-surface-cream">
      <AdminSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar admin={admin} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
