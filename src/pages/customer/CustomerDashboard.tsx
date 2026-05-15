import { ShoppingBag, MapPin, Gift, UtensilsCrossed, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "@/features/orders/ordersApi";
import { useGetMyAccountQuery } from "@/features/loyalty/loyaltyApi";
import { useAppSelector } from "@/app/hooks";
import { PATHS } from "@/routes/paths";
import { LOYALTY_TIER_LABEL, LOYALTY_TIER_COLOR, type TLoyaltyTier } from "@/types/loyalty";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type TOrderStatus } from "@/types/order";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const quickActions = [
  { label: "Browse Meals", path: PATHS.CUSTOMER.MEALS, icon: UtensilsCrossed, desc: "Explore today's menu" },
  { label: "My Orders", path: PATHS.CUSTOMER.ORDERS, icon: ShoppingBag, desc: "Track your orders" },
  { label: "Addresses", path: PATHS.CUSTOMER.ADDRESSES, icon: MapPin, desc: "Manage delivery addresses" },
  { label: "Loyalty", path: PATHS.CUSTOMER.LOYALTY, icon: Gift, desc: "Points & rewards" },
];

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CustomerDashboard() {
  usePageTitle("Dashboard");
  const { user } = useAppSelector((s) => s.auth);
  const { data: ordersData, isLoading: loadingOrders } = useGetMyOrdersQuery({ pageNumber: 1, pageSize: 3 });
  const { data: accountData, isLoading: loadingAccount } = useGetMyAccountQuery();

  const recentOrders = ordersData?.data?.data ?? [];
  const account = accountData?.data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">What would you like to eat today?</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Loyalty card */}
        <div>
          {loadingAccount ? (
            <Skeleton className="h-36 rounded-xl" />
          ) : account ? (
            <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-orange-500" />
                  <span className="text-sm font-semibold text-orange-700">Loyalty Points</span>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", LOYALTY_TIER_COLOR[account.tier as TLoyaltyTier])}>
                  {LOYALTY_TIER_LABEL[account.tier as TLoyaltyTier]}
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-800">
                {account.currentPoints.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-gray-500">pts</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ≈ ${account.pointsValueInCurrency.toFixed(2)} value
                {account.pointsToNextTier > 0 && ` · ${account.pointsToNextTier} pts to next tier`}
              </p>
              <Link
                to={PATHS.CUSTOMER.LOYALTY}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
              >
                View rewards <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400">
              No loyalty account yet.
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
            <Link to={PATHS.CUSTOMER.ORDERS} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10 text-center">
              <ShoppingBag size={28} className="mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No orders yet.</p>
              <Link to={PATHS.CUSTOMER.MEALS} className="mt-2 text-xs font-medium text-orange-500 hover:text-orange-600">
                Browse meals →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Order <span className="font-mono">#{shortId(order.id)}</span>
                    </p>
                    <p className="text-xs text-gray-400">{order.createdAt ? formatDate(order.createdAt) : "—"} · {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", ORDER_STATUS_COLOR[order.status as TOrderStatus])}>
                      {ORDER_STATUS_LABEL[order.status as TOrderStatus]}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">${order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(({ label, path, icon: Icon, desc }) => (
            <Link
              key={path}
              to={path}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 hover:border-orange-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
