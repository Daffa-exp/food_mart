import { z } from "zod";

export const createOrderSchema = z.object({
  // Data pemesan (recipient) untuk order — checkout wajib login, field ini
  // tetap diminta karena penerima paket bisa beda dari nama akun (mis. dikirim
  // ke orang lain).
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().min(9, "Nomor telepon tidak valid"),

  // Informasi pengiriman
  fullAddress: z.string().min(10, "Alamat pengiriman terlalu singkat"),
  addressNote: z.string().optional(),
  city: z.string().min(1, "Kota wajib dipilih"),
  postalCode: z.string().min(5, "Kode pos tidak valid"),
  deliveryMethod: z.enum(["instant", "same_day", "regular"]),

  orderNote: z.string().optional(),
  couponCode: z.string().optional(),

  // Item keranjang — harga TIDAK dipercaya dari sini, hanya productId & quantity
  items: z
    .array(
      z.object({
        productId: z.string().uuid("productId harus UUID produk dari database"),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Keranjang tidak boleh kosong"),
});

export type CreateOrderPayload = z.infer<typeof createOrderSchema>;
