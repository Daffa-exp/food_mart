"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { AdminProfile } from "@/types/admin";

export default function AdminTopbar({ admin }: { admin: AdminProfile }) {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  async function handleLogout() {
    await signOut();
    toast.success("Berhasil keluar dari Admin Panel");
    router.push("/admin/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-surface-border bg-white px-4 py-3 sm:px-6">
      <div>
        <p className="text-sm font-semibold text-ink-900">Halo, {admin.fullName.split(" ")[0]} 👋</p>
        <p className="text-xs text-ink-400 capitalize">{admin.role.replace("_", " ")}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
          {admin.fullName.slice(0, 2).toUpperCase()}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-pill border border-surface-border px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-surface-cream"
        >
          <LogOut className="h-3.5 w-3.5" /> Keluar
        </button>
      </div>
    </header>
  );
}
