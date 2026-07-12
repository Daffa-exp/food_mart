"use client";

import { useQuery } from "@tanstack/react-query";
import { productService, categoryService, bannerService, promotionService, ProductListParams } from "@/services/product.service";
import { reviewService } from "@/services/review.service";

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.list(params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductReviews(productId?: string) {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => reviewService.listByProduct(productId as string),
    enabled: !!productId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerService.list(),
    staleTime: 60 * 1000,
  });
}

export function usePromotions() {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: () => promotionService.list(),
    staleTime: 60 * 1000,
  });
}
