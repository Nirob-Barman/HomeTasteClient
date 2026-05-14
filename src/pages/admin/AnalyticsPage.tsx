import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  HeadphonesIcon,
  RefreshCw,
} from "lucide-react";
import { useGetDashboardStatsQuery } from "@/features/analytics/analyticsApi";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/utils/usePageTitle";

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function fmtCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color)}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{children}</h2>;
}

export default function AnalyticsPage() {
  usePageTitle("Analytics");
  const { data, isLoading, isError, refetch, isFetching } = useGetDashboardStatsQuery();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Analytics</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Failed to load analytics. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.dailyRevenueLast30Days.map((d) => d.revenue), 1);

  return (
    <div className={cn("p-6 space-y-6", isFetching && "opacity-75")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Analytics</h1>
          <p className="mt-0.5 text-sm text-gray-500">Live dashboard overview</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Order KPIs */}
      <section className="space-y-3">
        <SectionTitle>Orders</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="All-Time Orders"
            value={fmt(stats.orders.totalAllTime)}
            icon={ShoppingBag}
            color="bg-blue-50 text-blue-500"
          />
          <StatCard
            label="Today"
            value={fmt(stats.orders.todayCount)}
            sub="orders today"
            icon={TrendingUp}
            color="bg-orange-50 text-orange-500"
          />
          <StatCard
            label="This Week"
            value={fmt(stats.orders.thisWeekCount)}
            sub="orders this week"
            icon={TrendingUp}
            color="bg-violet-50 text-violet-500"
          />
          <StatCard
            label="This Month"
            value={fmt(stats.orders.thisMonthCount)}
            sub={`Avg ${fmtCurrency(stats.orders.averageOrderValue)}`}
            icon={ShoppingBag}
            color="bg-emerald-50 text-emerald-600"
          />
        </div>
      </section>

      {/* Revenue KPIs */}
      <section className="space-y-3">
        <SectionTitle>Revenue</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="All-Time Revenue"
            value={fmtCurrency(stats.revenue.totalAllTime)}
            icon={DollarSign}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Today"
            value={fmtCurrency(stats.revenue.today)}
            icon={DollarSign}
            color="bg-orange-50 text-orange-500"
          />
          <StatCard
            label="This Week"
            value={fmtCurrency(stats.revenue.thisWeek)}
            icon={DollarSign}
            color="bg-violet-50 text-violet-500"
          />
          <StatCard
            label="This Month"
            value={fmtCurrency(stats.revenue.thisMonth)}
            icon={DollarSign}
            color="bg-blue-50 text-blue-500"
          />
        </div>
      </section>

      {/* Daily Revenue Chart */}
      <section className="space-y-3">
        <SectionTitle>Daily Revenue — Last 30 Days</SectionTitle>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex h-40 items-end gap-0.5">
            {stats.dailyRevenueLast30Days.map((point) => {
              const heightPct = (point.revenue / maxRevenue) * 100;
              return (
                <div
                  key={point.date}
                  className="group relative flex-1 flex flex-col items-center justify-end"
                >
                  <div
                    className="w-full rounded-t bg-orange-400 group-hover:bg-orange-500 transition-colors"
                    style={{ height: `${Math.max(heightPct, 1)}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white whitespace-nowrap group-hover:block z-10">
                    {point.date.slice(5)}: {fmtCurrency(point.revenue)} ({point.orderCount} orders)
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>{stats.dailyRevenueLast30Days[0]?.date.slice(5)}</span>
            <span>{stats.dailyRevenueLast30Days[stats.dailyRevenueLast30Days.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <section className="space-y-3">
          <SectionTitle>Orders by Status</SectionTitle>
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {stats.ordersByStatus.map((row) => (
              <div key={row.status} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">{row.status}</span>
                <span className="text-sm font-medium text-gray-800">{fmt(row.count)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Support Summary */}
        <section className="space-y-3">
          <SectionTitle>Support Tickets</SectionTitle>
          <div className="rounded-lg border border-gray-200 bg-white p-4 grid grid-cols-2 gap-3">
            {[
              { label: "Total", value: stats.supportSummary.total, color: "text-gray-700" },
              { label: "Open", value: stats.supportSummary.open, color: "text-orange-600" },
              { label: "In Progress", value: stats.supportSummary.inProgress, color: "text-blue-600" },
              { label: "Resolved", value: stats.supportSummary.resolved, color: "text-emerald-600" },
              { label: "Closed", value: stats.supportSummary.closed, color: "text-gray-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <HeadphonesIcon size={14} className={color} />
                <span className="text-xs text-gray-500 flex-1">{label}</span>
                <span className={cn("text-sm font-medium", color)}>{fmt(value)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Loyalty Summary */}
        <section className="space-y-3">
          <SectionTitle>Loyalty Program</SectionTitle>
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            {[
              { label: "Active Accounts", value: fmt(stats.loyaltySummary.totalActiveAccounts) },
              { label: "Points Issued", value: fmt(stats.loyaltySummary.totalPointsIssued) },
              { label: "Points Redeemed", value: fmt(stats.loyaltySummary.totalPointsRedeemed) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Inventory Summary */}
        <section className="space-y-3">
          <SectionTitle>Inventory</SectionTitle>
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            {[
              { label: "Total Items", value: fmt(stats.inventorySummary.totalItems), color: "text-gray-800" },
              { label: "Low Stock", value: fmt(stats.inventorySummary.lowStockCount), color: "text-orange-600" },
              { label: "Out of Stock", value: fmt(stats.inventorySummary.outOfStockCount), color: "text-red-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={cn("text-sm font-semibold", color)}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Meals */}
        <section className="space-y-3">
          <SectionTitle>Top Meals</SectionTitle>
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {stats.topMeals.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">No data</p>
            ) : (
              stats.topMeals.map((meal, i) => (
                <div key={meal.mealId} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {meal.mealName ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">{fmt(meal.totalQuantityOrdered)} ordered</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {fmtCurrency(meal.totalRevenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Top Customers */}
        <section className="space-y-3">
          <SectionTitle>Top Customers</SectionTitle>
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {stats.topCustomers.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">No data</p>
            ) : (
              stats.topCustomers.map((customer, i) => (
                <div key={customer.userId} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                    <Users size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {customer.fullName ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">{customer.email ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      {fmtCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-400">{fmt(customer.totalOrders)} orders</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
