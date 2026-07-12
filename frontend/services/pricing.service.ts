import { apiClient } from "@/services/api-client";

export interface PricingSettings {
  shippingFee: Record<"instant" | "same_day" | "regular", number>;
  freeShippingMinPurchase: number;
  serviceFee: number;
}

export const pricingService = {
  async getPricing(): Promise<PricingSettings> {
    const { data } = await apiClient.get("/settings/pricing");
    return data.data;
  },
};
