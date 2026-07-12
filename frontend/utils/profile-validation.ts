import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  phoneNumber: z
    .string()
    .min(9, "Nomor telepon tidak valid")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
});
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
