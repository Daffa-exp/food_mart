import { apiClient } from "@/services/api-client";
import { Order } from "@/types/entities";

export const orderHistoryService = {
  async listMine(): Promise<Order[]> {
    const { data } = await apiClient.get("/orders/me");
    return data.data;
  },
};
