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
  clientSecret?: string;
  publishableKey?: string;
  merchantNumber?: string;
  redirectUrl?: string;
}

export interface TPaymentGateway {
  id: string;
  name: string;
  slug: string;
  gatewayType: string; // "card" | "manual" | "checkout"
  isConfigured: boolean;
  publishableKeyHint: string | null; // first 8 chars + "…", admin display only
  merchantNumber: string | null;     // customer-safe (bKash phone number)
  isActive: boolean;
  isSandbox: boolean;
  createdAt: string | null;
}

export interface CreatePaymentGatewayRequest {
  name: string;
  slug: string;
  gatewayType: string;
  publishableKey?: string;
  secretKey?: string;
  merchantNumber?: string;
  isActive: boolean;
  isSandbox: boolean;
}

export interface UpdatePaymentGatewayRequest {
  name: string;
  publishableKey?: string;
  secretKey?: string;
  merchantNumber?: string;
  isActive: boolean;
  isSandbox: boolean;
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
