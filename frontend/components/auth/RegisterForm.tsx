"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { registerSchema, RegisterFormValues } from "@/utils/validation";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterForm() {
  const signUpWithPassword = useAuthStore((s) => s.signUpWithPassword);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      await signUpWithPassword(values.email, values.password, values.fullName);
      toast.success("Akun berhasil dibuat! Cek email untuk verifikasi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mendaftar dengan Google");
      setIsGoogleLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-extrabold text-ink-900">Buat Akun Baru 👋</h2>
      <p className="mt-1.5 text-sm text-ink-700">
        Bergabung dengan FoodMart dan mulai pesan makanan favoritmu.
      </p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-input border border-surface-border bg-white py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-cream disabled:opacity-60"
      >
        <GoogleIcon />
        {isGoogleLoading ? "Mengarahkan ke Google..." : "Daftar dengan Google"}
      </button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-surface-border" />
        <span className="text-xs text-ink-400">atau daftar dengan email</span>
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nama Lengkap"
          icon={User}
          placeholder="Masukkan nama lengkap"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="Alamat Email"
          type="email"
          icon={Mail}
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            Nomor Telepon
          </label>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 rounded-input border border-surface-border bg-surface-cream/60 px-3 text-sm text-ink-700">
              🇮🇩 +62
            </span>
            <input
              placeholder="8xx-xxxx-xxxx"
              className="w-full rounded-input border border-surface-border bg-surface-cream/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              {...register("phoneNumber")}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        <Input
          label="Password"
          icon={Lock}
          isPassword
          placeholder="Minimal 8 karakter"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Konfirmasi Password"
          icon={Lock}
          isPassword
          placeholder="Ulangi password kamu"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Konfirmasi"}
        </Button>
      </form>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.74Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.6l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}
