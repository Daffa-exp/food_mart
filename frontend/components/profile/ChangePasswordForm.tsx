"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { Lock } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { changePasswordSchema, ChangePasswordValues } from "@/utils/profile-validation";
import { supabase } from "@/services/supabase-client";

export default function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordValues) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) throw error;
      toast.success("Password berhasil diperbarui");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Password Baru"
        icon={Lock}
        isPassword
        placeholder="Minimal 8 karakter"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <Input
        label="Konfirmasi Password Baru"
        icon={Lock}
        isPassword
        placeholder="Ulangi password baru"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Ubah Password"}
      </Button>
    </form>
  );
}
