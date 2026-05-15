import { Truck, ArrowRight, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetMyDeliveriesQuery } from "@/features/delivery/deliveryApi";
import { useAppSelector } from "@/app/hooks";
import { PATHS } from "@/routes/paths";
import { DELIVERY_STATUS, DELIVERY_STATUS_LABEL, DELIVERY_STATUS_COLOR, type TDeliveryStatus } from "@/types/delivery";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function DeliveryDashboard() {
  usePageTitle("Dashboard");
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading } = useGetMyDeliveriesQuery();
  const assignments = data?.data ?? [];

  const assigned = assignments.filter((a) => a.status === DELIVERY_STATUS.Assigned).length;
  const pickedUp = assignments.filter((a) => a.status === DELIVERY_STATUS.PickedUp).length;
  const delivered = assignments.filter((a) => a.status === DELIVERY_STATUS.Delivered).length;
  const failed = assignments.filter((a) => a.status === DELIVERY_STATUS.Failed).length;

  const statCards = [
    { label: DELIVERY_STATUS_LABEL[1], count: assigned, color: "bg-blue-50 text-blue-600", icon: Package },
    { label: DELIVERY_STATUS_LABEL[2], count: pickedUp, color: "bg-orange-50 text-orange-600", icon: Truck },
    { label: DELIVERY_STATUS_LABEL[3], count: delivered, color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
    { label: DELIVERY_STATUS_LABEL[4], count: failed, color: "bg-red-50 text-red-500", icon: AlertCircle },
  ];

  const active = assignments.filter(
    (a) => a.status === DELIVERY_STATUS.Assigned || a.status === DELIVERY_STATUS.PickedUp
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {assignments.length === 0
            ? "No assignments yet."
            : `You have ${assigned + pickedUp} active assignment${assigned + pickedUp !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-lg", color)}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active assignments preview */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Active Assignments</h2>
          <Link to={PATHS.DELIVERY.ASSIGNMENTS} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-10 text-center">
            <Truck size={28} className="mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No active assignments right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Order <span className="font-mono">#{a.orderId.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Assignment <span className="font-mono">#{a.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", DELIVERY_STATUS_COLOR[a.status as TDeliveryStatus])}>
                  {DELIVERY_STATUS_LABEL[a.status as TDeliveryStatus]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
