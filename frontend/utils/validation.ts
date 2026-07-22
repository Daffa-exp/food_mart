import { z } from "zod";

// Domain email sekali-pakai/palsu yang umum dipakai buat asal daftar (bukan
// daftar lengkap — cukup untuk menyaring kasus paling umum). Kalau ada
// domain baru yang perlu diblokir, tinggal tambah di sini.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "throwawaymail.com",
]);

const emailField = z
  .string()
  .min(1, "Email wajib diisi")
  .trim()
  .toLowerCase()
  .email("Format email tidak valid")
  .refine((email) => {
    const domain = email.split("@")[1];
    return !DISPOSABLE_EMAIL_DOMAINS.has(domain);
  }, "Gunakan alamat email asli, bukan email sekali-pakai")
  .refine((email) => {
    // Domain harus punya minimal satu titik dan TLD sungguhan (bukan
    // "test@test" atau "a@b" yang lolos regex .email() versi longgar).
    const domain = email.split("@")[1] ?? "";
    return /\.[a-z]{2,}$/i.test(domain);
  }, "Domain email tidak valid");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password wajib diisi"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    email: emailField,
    phoneNumber: z
      .string()
      .min(9, "Nomor telepon tidak valid")
      .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;
