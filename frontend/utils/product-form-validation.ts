import { z } from "zod";

export const productFormSchema = z.object({
  categoryId: z.string().uuid("Kategori wajib dipilih"),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z.string().min(3).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung"),
  shortDescription: z.string().max(255).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  compositionText: z.string().optional().or(z.literal("")), // dipisah baris baru, di-parse jadi array saat submit
  storageInfo: z.string().optional().or(z.literal("")),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  calories: z.coerce.number().int().nonnegative().optional(),
  spicyLevel: z.coerce.number().int().min(0).max(5).optional(),
  portionInfo: z.string().optional().or(z.literal("")),
  weightInfo: z.string().optional().or(z.literal("")),
  shelfLifeInfo: z.string().optional().or(z.literal("")),
  expiryInfo: z.string().optional().or(z.literal("")),
  isBestSeller: z.boolean().default(false),
  isPromo: z.boolean().default(false),
  isNew: z.boolean().default(false),
  imagesText: z.string().optional().or(z.literal("")), // satu URL per baris
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
