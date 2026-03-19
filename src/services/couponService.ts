import api from "./api";

export interface CouponInput {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  expiry: string;
  usageLimit?: number;
}

export interface CouponUpdateInput extends Partial<CouponInput> {
  id: string;
  isActive?: boolean;
}

export const getCoupons = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => api.get("/coupons", { params });

export const createCoupon = (coupon: CouponInput) =>
  api.post("/coupons", coupon);

export const updateCoupon = (coupon: CouponUpdateInput) =>
  api.put("/coupons", coupon);

export const deleteCoupon = (id: string) =>
  api.delete("/coupons", { params: { id } });

export const applyCoupon = (code: string) =>
  api.post("/coupons/apply", { code });