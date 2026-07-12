import { useQuery } from "@tanstack/react-query";
import { pricingService } from "@/services/pricing.service";

export function usePricingSettings() {
  return useQuery({
    queryKey: ["pricing-settings"],
    queryFn: () => pricingService.getPricing(),
    staleTime: 60 * 1000,
  });
}
