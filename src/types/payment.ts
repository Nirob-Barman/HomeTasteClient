export type TPaymentStatus = 1 | 2 | 3 | 4;

export const PAYMENT_STATUS = {
  Pending: 1,
  Success: 2,
  Failed: 3,
  Refunded: 4,
} as const;

export const PAYMENT_STATUS_LABEL: Record<TPaymentStatus, string> = {
  1: "Pending",
  2: "Success",
  3: "Failed",
  4: "Refunded",
};

export const PAYMENT_STATUS_COLOR: Record<TPaymentStatus, string> = {
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-emerald-100 text-emerald-700",
  3: "bg-red-100 text-red-600",
  4: "bg-gray-100 text-gray-600",
};

export interface TPaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  status: TPaymentStatus;
  statusLabel: string | null;
  gateway: string | null;
  transactionRef: string | null;
  notes: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string | null;
}

export interface InitiatePaymentRequest {
  orderId: string;
  gateway?: string;
  notes?: string;
}

export interface ConfirmPaymentRequest {
  transactionRef?: string;
  notes?: string;
}

export interface RefundPaymentRequest {
  notes?: string;
}
