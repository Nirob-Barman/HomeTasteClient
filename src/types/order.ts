export type TOrderStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const ORDER_STATUS = {
  Pending: 1,
  Confirmed: 2,
  Preparing: 3,
  ReadyForPickup: 4,
  OutForDelivery: 5,
  Delivered: 6,
  Cancelled: 7,
  Refunded: 8,
} as const;

export const ORDER_STATUS_LABEL: Record<TOrderStatus, string> = {
  1: "Pending",
  2: "Confirmed",
  3: "Preparing",
  4: "Ready for Pickup",
  5: "Out for Delivery",
  6: "Delivered",
  7: "Cancelled",
  8: "Refunded",
};

export const ORDER_STATUS_COLOR: Record<TOrderStatus, string> = {
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-orange-100 text-orange-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-indigo-100 text-indigo-700",
  6: "bg-emerald-100 text-emerald-700",
  7: "bg-red-100 text-red-600",
  8: "bg-gray-100 text-gray-600",
};

export const NEXT_STATUS: Partial<Record<TOrderStatus, TOrderStatus>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
};

export interface CreateOrderRequest {
  addressId: string;
  items: { mealId: string; quantity: number; specialInstructions?: string }[];
  couponCode?: string;
  pointsToRedeem: number;
  notes?: string;
}

export interface TOrderItem {
  id: string;
  mealId: string;
  mealName: string | null;
  mealImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions: string | null;
}

export interface TDeliveryFee {
  fee: number;
  isFree: boolean;
  label: string;
  freeThreshold: number;
}

export interface TOrder {
  id: string;
  userId: string;
  addressId: string;
  addressSummary: string | null;
  status: TOrderStatus;
  statusLabel: string | null;
  subTotal: number;
  deliveryFee: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  loyaltyPointsUsed: number;
  loyaltyDiscountAmount: number;
  createdAt: string | null;
  items: TOrderItem[] | null;
}
