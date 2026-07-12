import { z } from "zod";

export const productAdminSchema = z.object({
  categoryId: z.string().uuid("Kategori wajib dipilih"),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  shortDescription: z.string().max(255).optional(),
  description: z.string().optional(),
  composition: z.array(z.string()).optional(),
  storageInfo: z.string().optional(),
  price: z.number().positive("Harga harus lebih dari 0"),
  discountPercentage: z.number().min(0).max(100).default(0),
  calories: z.number().int().nonnegative().optional(),
  spicyLevel: z.number().int().min(0).max(5).optional(),
  portionInfo: z.string().optional(),
  weightInfo: z.string().optional(),
  shelfLifeInfo: z.string().optional(),
  expiryInfo: z.string().optional(),
  isBestSeller: z.boolean().default(false),
  isPromo: z.boolean().default(false),
  isNew: z.boolean().default(false),
  images: z.array(z.string().trim().url()).optional(),
});

export type ProductAdminPayload = z.infer<typeof productAdminSchema>;

// Mapping camelCase (payload frontend) -> snake_case (kolom database)
export function toProductRow(payload: Partial<ProductAdminPayload>) {
  return {
    category_id: payload.categoryId,
    name: payload.name,
    slug: payload.slug,
    short_description: payload.shortDescription,
    description: payload.description,
    composition: payload.composition,
    storage_info: payload.storageInfo,
    price: payload.price,
    discount_percentage: payload.discountPercentage,
    calories: payload.calories,
    spicy_level: payload.spicyLevel,
    portion_info: payload.portionInfo,
    weight_info: payload.weightInfo,
    shelf_life_info: payload.shelfLifeInfo,
    expiry_info: payload.expiryInfo,
    is_best_seller: payload.isBestSeller,
    is_promo: payload.isPromo,
    is_new: payload.isNew,
    images: payload.images,
  };
}
