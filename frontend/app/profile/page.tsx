"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import SavedAddressesSection from "@/components/profile/SavedAddressesSection";
import { useProfile } from "@/hooks/useAccountData";
import { useAuthStore } from "@/store/auth-store";

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <PageHeader
        breadcrumb={[{ label: "Beranda", href: "/" }, { label: "Profil Saya" }]}
        title="Profil Saya"
        subtitle="Kelola informasi akun dan keamanan kamu"
      />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <RequireAuth message="Masuk untuk melihat profil kamu">
          <ProfileContent />
        </RequireAuth>
      </main>

      <Footer />
    </>
  );
}

function ProfileContent() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const { data: profile, isLoading, isError } = useProfile();

  async function handleLogout() {
    await signOut();
    toast.success("Berhasil keluar");
    router.push("/");
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-card bg-surface-cream" />;
  }

  if (isError || !profile) {
    return <p className="py-10 text-center text-sm text-red-500">Gagal memuat profil.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-card border border-surface-border bg-white p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-white">
          {profile.fullName.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="font-bold text-ink-900">{profile.fullName}</p>
          <p className="text-sm text-ink-700">{profile.email}</p>
          {!profile.isEmailVerified && (
            <span className="mt-1 inline-block rounded-pill bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              Email belum diverifikasi
            </span>
          )}
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Informasi Akun</h3>
        <ProfileForm profile={profile} />
      </div>

      <SavedAddressesSection />

      <div className="rounded-card border border-surface-border bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Ubah Password</h3>
        <ChangePasswordForm />
      </div>

      <Button variant="outline" onClick={handleLogout} className="w-full text-red-500 border-red-200 hover:bg-red-50">
        <LogOut className="h-4 w-4" /> Keluar dari Akun
      </Button>
    </div>
  );
}
