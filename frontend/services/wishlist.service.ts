import { apiClient } from "@/services/api-client";
import { WishlistEntry } from "@/types/entities";

export const wishlistService = {
  async list(): Promise<WishlistEntry[]> {
    const { data } = await apiClient.get("/wishlist");
    return data.data;
  },
  async add(productId: string) {
    await apiClient.post("/wishlist", { productId });
  },
  async remove(productId: string) {
    await apiClient.delete(`/wishlist/${productId}`);
  },
};
