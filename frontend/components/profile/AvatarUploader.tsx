"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "@/services/upload.service";
import { userService } from "@/services/user.service";
import { UserProfile } from "@/types/entities";

export default function AvatarUploader({ profile }: { profile: UserProfile }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const updateAvatar = useMutation({
    mutationFn: (avatarUrl: string) => userService.updateProfile({ avatarUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto profil berhasil diperbarui");
    },
    onError: () => toast.error("Gagal menyimpan foto profil"),
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Folder "avatars" — dipakai lewat endpoint customer (/uploads),
      // bukan admin, sesuai ALLOWED_CUSTOMER_FOLDERS di backend.
      const { url } = await uploadService.uploadImage(file, "avatars");
      await updateAvatar.mutateAsync(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative h-16 w-16 shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {profile.avatarUrl ? (
        <span className="relative block h-16 w-16 overflow-hidden rounded-full">
          <Image src={profile.avatarUrl} alt={profile.fullName} fill unoptimized className="object-cover" />
        </span>
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-white">
          {profile.fullName.slice(0, 2).toUpperCase()}
        </span>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Ganti foto profil"
        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-ink-900 text-white shadow-sm transition-colors hover:bg-primary-500 disabled:opacity-60"
      >
        {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
      </button>
    </div>
  );
}
