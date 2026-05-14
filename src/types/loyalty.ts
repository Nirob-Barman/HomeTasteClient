export type TLoyaltyTier = 1 | 2 | 3 | 4;
export type TLoyaltyTransactionType = 1 | 2 | 3 | 4;

export const LOYALTY_TIER_LABEL: Record<TLoyaltyTier, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
};

export const LOYALTY_TIER_COLOR: Record<TLoyaltyTier, string> = {
  1: "text-amber-700 bg-amber-100",
  2: "text-gray-500 bg-gray-100",
  3: "text-yellow-600 bg-yellow-100",
  4: "text-violet-600 bg-violet-100",
};

export const TRANSACTION_TYPE_LABEL: Record<TLoyaltyTransactionType, string> = {
  1: "Earned",
  2: "Redeemed",
  3: "Expired",
  4: "Adjusted",
};

export const TRANSACTION_TYPE_COLOR: Record<TLoyaltyTransactionType, string> = {
  1: "text-emerald-600",
  2: "text-orange-500",
  3: "text-gray-400",
  4: "text-blue-500",
};

export interface TLoyaltyAccount {
  id: string;
  userId: string | null;
  currentPoints: number;
  totalPointsEarned: number;
  tier: TLoyaltyTier;
  tierLabel: string | null;
  pointsToNextTier: number;
  pointsValueInCurrency: number;
  createdAt: string | null;
}

export interface TLoyaltyTransaction {
  id: string;
  points: number;
  transactionType: TLoyaltyTransactionType;
  typeLabel: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string | null;
}

export interface TPointsPreview {
  pointsToRedeem: number;
  discountAmount: number;
  remainingPoints: number;
}
