"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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

  const isLoading = !hasMounted || isUserLoading || (!!user && isAdminLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!user || isError) {
      router.replace("/admin/login");
    }
  }, [isLoading, user, isError, router]);

  if (isLoading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-cream">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar admin={admin} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
