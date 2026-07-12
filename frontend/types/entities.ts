// =========================================================
// Tipe data kanonis — bentuk ini yang dikembalikan backend API
// (lihat backend/src/utils/transformers.ts -> toProductDTO)
// =========================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  categorySlug: string;
  categoryLabel: string;
  name: string;
  shortDescription: string;
  description: string;
  composition: string[];
  storageInfo: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  images: string[];
  rating: number;
  ratingCount: number;
  soldCount: number;
  isBestSeller: boolean;
  isPromo: boolean;
  isNew: boolean;
  stockQuantity: number;
  calories: number;
  spicyLevel: number;
  portionInfo: string;
  weightInfo: string;
  shelfLifeInfo: string;
  productionInfo: string;
  expiryInfo: string;
  originInfo: string;
}

export interface ProductDetail extends Product {
  relatedProducts: Product[];
}

export type OrderStatus =
  | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export type PaymentStatus =
  | "pending" | "settlement" | "expire" | "cancel" | "failure" | "challenge" | "refund";

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  delivery_method: "instant" | "same_day" | "regular";
  recipient_name: string;
  recipient_phone: string;
  full_address: string;
  city: string;
  postal_code: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  service_fee: number;
  total_amount: number;
  order_note: string | null;
  created_at: string;
  order_items: OrderItem[];
  payments: { status: PaymentStatus; payment_method: string | null }[];
}

export interface WishlistEntry {
  wishlistId: string;
  addedAt: string;
  product: Product;
}

export interface Notification {
  id: string;
  type: "order" | "promotion" | "system" | "payment" | "review";
  title: string;
  message: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  linkUrl: string | null;
  displayOrder: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  bannerImageUrl: string | null;
  discountPercentage: number | null;
  endDate: string;
  productSlug: string | null;
  productName: string | null;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}
