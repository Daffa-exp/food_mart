import { supabaseAdmin } from "../config/supabase";

export const couponRepository = {
  async findValidByCode(code: string) {
    const { data } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .lte("valid_from", new Date().toISOString())
      .gte("valid_until", new Date().toISOString())
      .maybeSingle();

    return data;
  },
};

export function calculateCouponDiscount(
  coupon: {
    type: "percentage" | "fixed_amount" | "free_shipping";
    value: number;
    min_purchase: number;
    max_discount: number | null;
    usage_limit: number | null;
    used_count: number;
  } | null,
  subtotal: number,
  shippingFee: number
): { discountAmount: number; freeShipping: boolean; error?: string } {
  if (!coupon) return { discountAmount: 0, freeShipping: false };

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { discountAmount: 0, freeShipping: false, error: "Kupon sudah mencapai batas penggunaan" };
  }
  if (subtotal < coupon.min_purchase) {
    return {
      discountAmount: 0,
      freeShipping: false,
      error: `Minimal belanja untuk kupon ini adalah Rp${coupon.min_purchase.toLocaleString("id-ID")}`,
    };
  }

  if (coupon.type === "free_shipping") {
    return { discountAmount: shippingFee, freeShipping: true };
  }

  if (coupon.type === "percentage") {
    let discount = (subtotal * coupon.value) / 100;
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
    return { discountAmount: Math.round(discount), freeShipping: false };
  }

  // fixed_amount
  return { discountAmount: Math.min(coupon.value, subtotal), freeShipping: false };
}
