"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, Phone } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { updateProfileSchema, UpdateProfileValues } from "@/utils/profile-validation";
import { userService } from "@/services/user.service";
import { UserProfile } from "@/types/entities";

export default function ProfileForm({ profile }: { profile: UserProfile }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: profile.fullName, phoneNumber: profile.phoneNumber ?? "" },
  });

  useEffect(() => {
    reset({ fullName: profile.fullName, phoneNumber: profile.phoneNumber ?? "" });
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (values: UpdateProfileValues) => userService.updateProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil berhasil diperbarui");
    },
    onError: () => toast.error("Gagal memperbarui profil"),
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
      <Input
        label="Nama Lengkap"
        icon={User}
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Input label="Email" value={profile.email} disabled readOnly className="cursor-not-allowed opacity-60" />
      <Input
        label="Nomor Telepon"
        icon={Phone}
        error={errors.phoneNumber?.message}
        {...register("phoneNumber")}
      />
      <Button type="submit" disabled={!isDirty || mutation.isPending}>
        {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
