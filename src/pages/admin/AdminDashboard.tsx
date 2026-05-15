import { LayoutDashboard, Users, UtensilsCrossed, ShoppingBag, Truck, TrendingUp, HeadphonesIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetDashboardStatsQuery } from "@/features/analytics/analyticsApi";
import { useAppSelector } from "@/app/hooks";
import { PATHS } from "@/routes/paths";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

const quickLinks = [
  { label: "Users", path: PATHS.ADMIN.USERS, icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Meals", path: PATHS.ADMIN.MEALS, icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600" },
  { label: "Orders", path: PATHS.ADMIN.ORDERS, icon: ShoppingBag, color: "bg-emerald-50 text-emerald-600" },
  { label: "Deliveries", path: PATHS.ADMIN.DELIVERIES, icon: Truck, color: "bg-indigo-50 text-indigo-600" },
  { label: "Analytics", path: PATHS.ADMIN.ANALYTICS, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  { label: "Support", path: PATHS.ADMIN.SUPPORT, icon: HeadphonesIcon, color: "bg-rose-50 text-rose-600" },
];

export default function AdminDashboard() {
  usePageTitle("Dashboard");
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading } = useGetDashboardStatsQuery();
  const stats = data?.data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening today.</p>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Orders Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{fmt(stats.orders.todayCount)}</p>
            <p className="mt-0.5 text-xs text-gray-400">{fmt(stats.orders.totalAllTime)} all time</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Revenue Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">${fmt(stats.revenue.today)}</p>
            <p className="mt-0.5 text-xs text-gray-400">${fmt(stats.revenue.thisMonth)} this month</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Open Support</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{fmt(stats.supportSummary.open)}</p>
            <p className="mt-0.5 text-xs text-gray-400">{fmt(stats.supportSummary.inProgress)} in progress</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">Out of Stock</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{fmt(stats.inventorySummary.outOfStockCount)}</p>
            <p className="mt-0.5 text-xs text-gray-400">{fmt(stats.inventorySummary.lowStockCount)} low stock</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick links */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickLinks.map(({ label, path, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-orange-200 hover:shadow-sm transition-shadow"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top meals */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Top Meals</h2>
            <Link to={PATHS.ADMIN.MEALS} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : stats?.topMeals.slice(0, 5).map((meal, i) => (
              <div key={meal.mealId} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-700">{meal.mealName ?? "—"}</p>
                  <p className="text-xs text-gray-400">{meal.totalQuantityOrdered} orders</p>
                </div>
                <span className="text-xs font-medium text-emerald-600">${fmt(meal.totalRevenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
