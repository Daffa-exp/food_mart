interface RawProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface RawCategory {
  id: string;
  name: string;
  slug: string;
}

interface RawInventory {
  stock_quantity: number;
}

export interface RawProductRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  composition: string[] | null;
  storage_info: string | null;
  price: number;
  discount_percentage: number;
  final_price: number;
  calories: number | null;
  spicy_level: number | null;
  portion_info: string | null;
  weight_info: string | null;
  shelf_life_info: string | null;
  production_info: string | null;
  expiry_info: string | null;
  origin_info: string | null;
  is_best_seller: boolean;
  is_promo: boolean;
  is_new: boolean;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  created_at: string;
  category: RawCategory | RawCategory[] | null;
  images: RawProductImage[] | null;
  inventory: RawInventory | RawInventory[] | null;
}

/**
 * Supabase JS mengembalikan relasi to-one kadang sebagai object, kadang
 * sebagai array berisi 1 elemen (tergantung ada/tidaknya FK unique hint).
 * Helper ini menormalkan keduanya.
 */
function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function toProductDTO(row: RawProductRow) {
  const category = firstOf(row.category);
  const inventory = firstOf(row.inventory);
  const sortedImages = [...(row.images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.display_order - b.display_order;
  });

  return {
    id: row.id,
    slug: row.slug,
    categorySlug: category?.slug ?? "",
    categoryLabel: category?.name ?? "",
    name: row.name,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    composition: row.composition ?? [],
    storageInfo: row.storage_info ?? "",
    price: Number(row.price),
    discountPercentage: Number(row.discount_percentage ?? 0),
    finalPrice: Number(row.final_price ?? row.price),
    images: sortedImages.map((img) => img.image_url),
    rating: Number(row.rating_avg ?? 0),
    ratingCount: row.rating_count ?? 0,
    soldCount: row.sold_count ?? 0,
    isBestSeller: row.is_best_seller,
    isPromo: row.is_promo,
    isNew: row.is_new,
    stockQuantity: inventory?.stock_quantity ?? 0,
    calories: row.calories ?? 0,
    spicyLevel: row.spicy_level ?? 0,
    portionInfo: row.portion_info ?? "",
    weightInfo: row.weight_info ?? "",
    shelfLifeInfo: row.shelf_life_info ?? "",
    productionInfo: row.production_info ?? "Hari Pemesanan",
    expiryInfo: row.expiry_info ?? "",
    originInfo: row.origin_info ?? "FoodMart Kitchen",
  };
}

export type ProductDTO = ReturnType<typeof toProductDTO>;
