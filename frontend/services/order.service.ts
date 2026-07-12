import { apiClient } from "@/services/api-client";

export interface CreateOrderPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  fullAddress: string;
  addressNote?: string;
  city: string;
  postalCode: string;
  deliveryMethod: "instant" | "same_day" | "regular";
  orderNote?: string;
  couponCode?: string;
  items: { productId: string; quantity: number }[];
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  snapToken: string;
  totalAmount: number;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const { data } = await apiClient.post<{ success: boolean; data: CreateOrderResponse }>(
      "/orders",
      payload
    );
    return data.data;
  },

  async getOrderById(orderId: string) {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data.data;
  },
};
