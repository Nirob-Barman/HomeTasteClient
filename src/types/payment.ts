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
  provider: string;  // family key: "stripe" | "bkash"
  slug: string;      // variant slug: "stripe_payment_intents" | "bkash_manual" | "bkash_checkout"
  isConfigured: boolean;
  publishableKeyHint: string | null;
  merchantNumber: string | null;
  isActive: boolean;
  isSandbox: boolean;
  createdAt: string | null;
}

// ─── Gateway Schema types (from GET /api/paymentgateway/schema) ──────────────

export interface TGatewayFieldDef {
  key: string;
  label: string;
  isSecret: boolean;
  isRequired: boolean;
  placeholder?: string;
}

export interface TGatewayVariantDef {
  slug: string;
  displayName: string;
  variantLabel: string;
  fields: TGatewayFieldDef[];
}

export interface TGatewayFamilyDef {
  key: string;
  displayName: string;
  variants: TGatewayVariantDef[];
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface CreatePaymentGatewayRequest {
  name: string;
  slug: string;
  config: Record<string, string>;
  isActive: boolean;
  isSandbox: boolean;
}

export interface UpdatePaymentGatewayRequest {
  name: string;
  config: Record<string, string>;
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

export interface ConfirmDirectPaymentRequest {
  orderId: string;
  gateway: string;
  transactionRef?: string;
  notes?: string;
}

export interface RefundPaymentRequest {
  notes?: string;
}
