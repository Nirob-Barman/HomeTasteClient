import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search, Gift } from "lucide-react";
import { useGetAccountByUserIdQuery, useAdjustPointsMutation } from "@/features/loyalty/loyaltyApi";
import { useGetUsersQuery } from "@/features/admin/adminApi";
import { LOYALTY_TIER_LABEL, LOYALTY_TIER_COLOR } from "@/types/loyalty";
import type { TLoyaltyTier } from "@/types/loyalty";
import type { TAdminUserResponse } from "@/types/user";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const adjustSchema = z.object({
  points: z.number({ error: "Required" }).int("Must be a whole number").refine((v) => v !== 0, "Cannot be 0"),
  description: z.string().optional(),
});
type AdjustFormData = z.infer<typeof adjustSchema>;

function AdjustModal({ userId, currentPoints, onClose }: { userId: string; currentPoints: number; onClose: () => void }) {
  const [adjust, { isLoading }] = useAdjustPointsMutation();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AdjustFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { points: 0, description: "" },
  });
  const pts = watch("points") || 0;

  async function onSubmit(data: AdjustFormData) {
    try {
      await adjust({ userId, ...data }).unwrap();
      toast.success(`Points ${pts > 0 ? "added" : "deducted"} successfully`);
      onClose();
    } catch {
      toast.error("Failed to adjust points");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-base font-semibold text-gray-800">Adjust Points</h2>
        <p className="mb-4 text-xs text-gray-400">Current balance: <span className="font-semibold text-gray-700">{currentPoints} pts</span></p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Points (positive = add, negative = deduct)</label>
            <input
              type="number"
              {...register("points", { valueAsNumber: true })}
              placeholder="e.g. 100 or -50"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
            {errors.points && <p className="mt-0.5 text-xs text-red-500">{errors.points.message}</p>}
            {pts !== 0 && (
              <p className="mt-0.5 text-xs text-gray-500">
                New balance: <span className="font-medium">{currentPoints + (isNaN(pts) ? 0 : pts)} pts</span>
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Reason (optional)</label>
            <input {...register("description")} placeholder="e.g. Goodwill adjustment" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60">
              {isLoading ? "Saving…" : "Adjust"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccountCard({ userId, onAdjust }: { userId: string; onAdjust: () => void }) {
  const { data, isLoading, isError } = useGetAccountByUserIdQuery(userId);
  const account = data?.data;

  if (isLoading) return <div className="h-32 animate-pulse rounded-xl bg-gray-100" />;
  if (isError || !account) return <p className="text-sm text-red-500">Loyalty account not found for this user.</p>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{account.currentPoints} <span className="text-base font-normal text-gray-400">pts</span></p>
          <p className="text-xs text-gray-400">Total earned: {account.totalPointsEarned} pts</p>
        </div>
        <div className="text-right space-y-1">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", LOYALTY_TIER_COLOR[account.tier as TLoyaltyTier])}>
            {LOYALTY_TIER_LABEL[account.tier as TLoyaltyTier]}
          </span>
          {account.pointsToNextTier > 0 && (
            <p className="text-xs text-gray-400">{account.pointsToNextTier} pts to next tier</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Value: <span className="font-medium text-gray-700">${account.pointsValueInCurrency.toFixed(2)}</span></span>
        <button onClick={onAdjust} className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600">
          Adjust Points
        </button>
      </div>
    </div>
  );
}

export default function AdminLoyaltyPage() {
  usePageTitle("Loyalty Admin");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [search, setSearch] = useState("");

  const { data: usersData } = useGetUsersQuery({ pageNumber: 1, pageSize: 200, search });
  const users = (usersData?.data?.data ?? []).filter((u: TAdminUserResponse) => !u.roles?.includes("Admin"));

  const { data: accountData } = useGetAccountByUserIdQuery(selectedUserId, { skip: !selectedUserId });
  const currentPoints = accountData?.data?.currentPoints ?? 0;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Loyalty Admin</h1>
        <p className="mt-0.5 text-sm text-gray-500">View and manage customer loyalty accounts</p>
      </div>

      {/* User search + select */}
      <div className="max-w-sm space-y-2">
        <label className="block text-xs font-medium text-gray-600">Search User</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-orange-400 focus:outline-none"
          />
        </div>
        <select
          value={selectedUserId}
          onChange={(e) => { setSelectedUserId(e.target.value); setShowAdjust(false); }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        >
          <option value="">— select a customer —</option>
          {users.map((u: TAdminUserResponse) => (
            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
          ))}
        </select>
      </div>

      {selectedUserId ? (
        <div className="max-w-sm">
          <AccountCard userId={selectedUserId} onAdjust={() => setShowAdjust(true)} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Gift size={32} className="mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">Select a customer to view their loyalty account.</p>
        </div>
      )}

      {showAdjust && selectedUserId && (
        <AdjustModal userId={selectedUserId} currentPoints={currentPoints} onClose={() => setShowAdjust(false)} />
      )}
    </div>
  );
}
