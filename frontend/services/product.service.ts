import { apiClient } from "@/services/api-client";
import { Product, ProductDetail, Category, Banner, Promotion } from "@/types/entities";

export interface ProductListParams {
  category?: string;
  search?: string;
  sort?: "terlaris" | "terbaru" | "harga_terendah" | "harga_tertinggi" | "rating";
  promo?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  page?: number;
  pageSize?: number;
}

export const productService = {
  async list(params: ProductListParams = {}): Promise<{ data: Product[]; total: number }> {
    const { data } = await apiClient.get("/products", { params });
    return { data: data.data, total: data.pagination.total };
  },

  async getBySlug(slug: string): Promise<ProductDetail> {
    const { data } = await apiClient.get(`/products/${slug}`);
    return data.data;
  },
};

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await apiClient.get("/categories");
    return data.data;
  },
};

export const bannerService = {
  async list(): Promise<Banner[]> {
    const { data } = await apiClient.get("/banners");
    return data.data;
  },
};

export const promotionService = {
  async list(): Promise<Promotion[]> {
    const { data } = await apiClient.get("/promotions");
    return data.data;
  },
};
