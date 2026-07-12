import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Fallback gambar generik — dipakai kalau produk belum punya URL gambar sama
// sekali (mis. dibuat lewat Admin Panel tanpa isi field "URL Gambar").
// Mencegah warning React: "An empty string was passed to the src attribute".
export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&q=80";

export function getProductImage(images: string[] | undefined | null): string {
  const first = images?.[0];
  return first && first.trim() !== "" ? first : PLACEHOLDER_IMAGE;
}
