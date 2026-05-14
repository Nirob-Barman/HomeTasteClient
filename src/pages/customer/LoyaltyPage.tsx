import { useState } from "react";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { useGetMyAccountQuery, useGetMyTransactionsQuery } from "@/features/loyalty/loyaltyApi";
import {
  LOYALTY_TIER_LABEL,
  LOYALTY_TIER_COLOR,
  TRANSACTION_TYPE_LABEL,
  TRANSACTION_TYPE_COLOR,
  type TLoyaltyTier,
  type TLoyaltyTransactionType,
} from "@/types/loyalty";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const PAGE_SIZE = 20;

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TIER_ORDER: TLoyaltyTier[] = [1, 2, 3, 4];

export default function LoyaltyPage() {
  usePageTitle("Loyalty Rewards");
  const [page, setPage] = useState(1);

  const { data: accountData, isLoading: loadingAccount } = useGetMyAccountQuery();
  const { data: txData, isLoading: loadingTx, isFetching } = useGetMyTransactionsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const account = accountData?.data;
  const transactions = txData?.data?.data ?? [];
  const meta = txData?.data?.metaData;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">Loyalty Rewards</h1>

      {/* Account summary */}
      {loadingAccount ? (
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
      ) : account ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            {/* Points + tier */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                <Gift size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {account.currentPoints.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">available points</p>
              </div>
            </div>

            {/* Tier badge */}
            <div className="text-right">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
                  LOYALTY_TIER_COLOR[account.tier as TLoyaltyTier]
                )}
              >
                {LOYALTY_TIER_LABEL[account.tier as TLoyaltyTier]} Tier
              </span>
              {account.pointsToNextTier > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  {account.pointsToNextTier.toLocaleString()} pts to next tier
                </p>
              )}
            </div>
          </div>

          {/* Tier progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              {TIER_ORDER.map((t) => (
                <span
                  key={t}
                  className={cn(
                    "font-medium",
                    t === account.tier ? "text-orange-500" : ""
                  )}
                >
                  {LOYALTY_TIER_LABEL[t]}
                </span>
              ))}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-orange-400 transition-all"
                style={{
                  width: `${Math.min(((account.tier - 1) / 3) * 100 + (account.pointsToNextTier === 0 ? 100 / 3 : 0), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-400">Total Earned</p>
              <p className="mt-0.5 text-base font-semibold text-gray-800">
                {account.totalPointsEarned.toLocaleString()} pts
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Points Value</p>
              <p className="mt-0.5 text-base font-semibold text-emerald-600">
                ${account.pointsValueInCurrency.toFixed(2)}
              </p>
            </div>
            {account.pointsToNextTier > 0 && (
              <div>
                <p className="text-xs text-gray-400">To Next Tier</p>
                <p className="mt-0.5 text-base font-semibold text-gray-800">
                  {account.pointsToNextTier.toLocaleString()} pts
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
          No loyalty account found.
        </div>
      )}

      {/* Transaction history */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Transaction History
        </h2>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y divide-gray-100", isFetching && "opacity-60")}>
              {loadingTx ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isPositive = tx.transactionType === 1 || tx.transactionType === 4;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-700">{tx.description ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            TRANSACTION_TYPE_COLOR[tx.transactionType as TLoyaltyTransactionType]
                          )}
                        >
                          {TRANSACTION_TYPE_LABEL[tx.transactionType as TLoyaltyTransactionType]}
                        </span>
                      </td>
                      <td className={cn(
                        "px-4 py-3 text-right font-semibold",
                        isPositive ? "text-emerald-600" : "text-orange-500"
                      )}>
                        {isPositive ? "+" : "−"}{Math.abs(tx.points).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && transactions.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–
              {(meta.pageNumber - 1) * PAGE_SIZE + transactions.length} of {meta.totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={meta.isFirstPage}
                className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - meta.pageNumber) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "min-w-[32px] rounded-md border px-2 py-1 text-xs",
                      p === meta.pageNumber
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={meta.isLastPage}
                className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
