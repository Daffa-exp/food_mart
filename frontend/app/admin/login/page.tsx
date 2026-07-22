"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Mail, Lock, Soup } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { loginSchema, LoginFormValues } from "@/utils/validation";
import { useAuthStore } from "@/store/auth-store";
import { adminAuthService } from "@/services/admin.service";

export default function AdminLoginPage() {
  const router = useRouter();
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const signOut = useAuthStore((s) => s.signOut);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await signInWithPassword(values.email, values.password);
      // Verifikasi role admin ke backend SETELAH login Supabase berhasil —
      // kalau bukan admin, sign out lagi.
      await adminAuthService.getMe();
      toast.success("Selamat datang, Admin!");
      router.push("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal masuk";
      if (message.toLowerCase().includes("akses admin")) {
        await signOut();
      }
      toast.error(message.includes("akses admin") ? message : "Email atau password salah");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white">
            <Soup className="h-6 w-6" />
          </span>
          <h1 className="mt-3 text-lg font-extrabold text-ink-900">FoodMart Admin Panel</h1>
          <p className="mt-1 text-sm text-ink-700">Masuk dengan akun Admin kamu</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Admin"
            type="email"
            icon={Mail}
            placeholder="admin@foodmart.id"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            icon={Lock}
            isPassword
            placeholder="Masukkan password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk ke Admin Panel"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Bukan admin? <a href="/login" className="text-primary-500 hover:underline">Kembali ke halaman customer</a>
        </p>
      </div>
    </div>
  );
}
