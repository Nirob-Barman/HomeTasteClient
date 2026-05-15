export type TDiscountType = 1 | 2;
export const DISCOUNT_TYPE = { Percentage: 1, Flat: 2 } as const;
export const DISCOUNT_TYPE_LABEL: Record<TDiscountType, string> = { 1: "Percentage", 2: "Flat" };

export interface TCoupon {
  id: string;
  code: string | null;
  description: string | null;
  discountType: TDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  isActive: boolean;
  isFirstOrderOnly: boolean;
  createdAt: string | null;
}

export interface TCouponValidationResponse {
  isValid: boolean;
  discountAmount: number;
  message: string | null;
  coupon: TCoupon | null;
}
