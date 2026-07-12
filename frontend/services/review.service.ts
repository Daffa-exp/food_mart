import { apiClient } from "@/services/api-client";

export interface MyReview {
  id: string;
  productId: string;
  orderItemId: string;
  rating: number;
  comment: string | null;
  adminReply: string | null;
  createdAt: string;
}

export interface CreateReviewPayload {
  orderItemId: string;
  rating: number;
  comment?: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  adminReply: string | null;
  createdAt: string;
}

export const reviewService = {
  async listMine(): Promise<MyReview[]> {
    const { data } = await apiClient.get("/reviews/me");
    return data.data;
  },
  async create(payload: CreateReviewPayload): Promise<MyReview> {
    const { data } = await apiClient.post("/reviews", payload);
    return data.data;
  },
  async listByProduct(productId: string): Promise<ProductReview[]> {
    const { data } = await apiClient.get("/reviews", { params: { productId } });
    return data.data;
  },
};
