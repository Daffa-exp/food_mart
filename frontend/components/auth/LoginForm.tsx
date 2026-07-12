"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Star, ShieldCheck, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { loginSchema, LoginFormValues } from "@/utils/validation";
import { useAuthStore } from "@/store/auth-store";

export default function LoginForm() {
  const router = useRouter();
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
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
      toast.success("Selamat datang kembali!");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal masuk, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-extrabold text-ink-900">Selamat Datang Kembali 👋</h2>
      <p className="mt-1.5 text-sm text-ink-700">
        Masuk ke akun FoodMart kamu dan mulai pesan makanan favoritmu.
      </p>

      <button
        type="button"
        onClick={() => toast("Integrasi Google Sign-In di Fase 5")}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-input border border-surface-border bg-white py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-surface-cream"
      >
        <GoogleIcon />
        Masuk dengan Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-surface-border" />
        <span className="text-xs text-ink-400">atau masuk dengan email</span>
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Alamat Email"
          type="email"
          icon={Mail}
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <Input
            label="Password"
            icon={Lock}
            isPassword
            placeholder="Masukkan password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-primary-500 hover:underline">
              Lupa Password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Memproses..." : "Masuk ke Akun"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-700">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-primary-500 hover:underline">
          Daftar Sekarang
        </Link>
      </p>

      <div className="mt-7 flex items-center justify-center gap-5 border-t border-surface-border pt-5 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5" /> Terpercaya
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> SSL Aman
        </span>
        <span className="flex items-center gap-1.5">
          <Gift className="h-3.5 w-3.5" /> Garansi Uang Kembali
        </span>
      </div>
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
