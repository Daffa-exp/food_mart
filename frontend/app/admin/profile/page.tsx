"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { useAdminProfile } from "@/hooks/useAdmin";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { supabaseAdminClient } from "@/services/supabase-admin-client";

export default function AdminProfilePage() {
  const router = useRouter();
  const { data: admin, isLoading, isError } = useAdminProfile();
  const signOut = useAdminAuthStore((s) => s.signOut);

  async function handleLogout() {
    await signOut();
    toast.success("Berhasil keluar");
    router.push("/admin/login");
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-card bg-white" />;
  if (isError || !admin) return <p className="text-sm text-red-500">Gagal memuat profil admin.</p>;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Admin Profile</h1>
        <p className="text-sm text-ink-700">Informasi akun Admin Panel kamu</p>
      </div>

      <div className="flex items-center gap-4 rounded-card border border-surface-border bg-white p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-white">
          {admin.fullName.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="font-bold text-ink-900">{admin.fullName}</p>
          <p className="text-sm text-ink-700">{admin.email}</p>
          <span className="mt-1 inline-block rounded-pill bg-primary-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-primary-500">
            {admin.role.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Ubah Password</h3>
        <ChangePasswordForm client={supabaseAdminClient} />
      </div>

      <Button variant="outline" onClick={handleLogout} className="w-full border-red-200 text-red-500 hover:bg-red-50">
        <LogOut className="h-4 w-4" /> Keluar dari Admin Panel
      </Button>
    </div>
  );
}
