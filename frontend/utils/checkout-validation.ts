import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  phoneNumber: z
    .string()
    .min(9, "Nomor telepon tidak valid")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  fullAddress: z.string().min(10, "Alamat pengiriman terlalu singkat"),
  addressNote: z.string().optional(),
  city: z.string().min(1, "Kota wajib dipilih"),
  postalCode: z.string().min(5, "Kode pos tidak valid").max(6, "Kode pos tidak valid"),
  deliveryMethod: z.enum(["instant", "same_day", "regular"]),
  orderNote: z.string().optional(),
  couponCode: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
