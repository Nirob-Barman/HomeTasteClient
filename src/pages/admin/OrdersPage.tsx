import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} from "@/features/orders/ordersApi";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  NEXT_STATUS,
  type TOrderStatus,
} from "@/types/order";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 15;

const STATUS_TABS: { label: string; value: TOrderStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: ORDER_STATUS.Pending },
  { label: "Confirmed", value: ORDER_STATUS.Confirmed },
  { label: "Preparing", value: ORDER_STATUS.Preparing },
  { label: "Ready", value: ORDER_STATUS.ReadyForPickup },
  { label: "Out for Delivery", value: ORDER_STATUS.OutForDelivery },
  { label: "Delivered", value: ORDER_STATUS.Delivered },
  { label: "Cancelled", value: ORDER_STATUS.Cancelled },
];

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TOrderStatus | undefined>(undefined);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading, isFetching } = useGetOrdersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    status: statusFilter,
  });

  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();

  const orders = data?.data?.data ?? [];
  const meta = data?.data?.metaData;

  function handleTabChange(value: TOrderStatus | undefined) {
    setStatusFilter(value);
    setPage(1);
  }

  async function handleAdvance(id: string, current: TOrderStatus) {
    const next = NEXT_STATUS[current];
    if (!next) return;
    try {
      await updateStatus({ id, status: next }).unwrap();
      toast.success(`Order advanced to ${ORDER_STATUS_LABEL[next]}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    try {
      await cancelOrder({ id: cancelTarget, reason: cancelReason || undefined }).unwrap();
      toast.success("Order cancelled");
      setCancelTarget(null);
      setCancelReason("");
    } catch {
      toast.error("Failed to cancel order");
    }
  }

  const isFinalStatus = (s: TOrderStatus) =>
    s === ORDER_STATUS.Delivered ||
    s === ORDER_STATUS.Cancelled ||
    s === ORDER_STATUS.Refunded;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Orders</h1>
          {meta && (
            <p className="mt-0.5 text-sm text-gray-500">{meta.totalCount} total orders</p>
          )}
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className={cn("transition-colors hover:bg-gray-50", isFetching && "opacity-60")}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium text-gray-700">
                      #{shortId(order.id)}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-[160px]">
                    <span className="text-xs text-gray-500 line-clamp-2">
                      {order.addressSummary ?? "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      ORDER_STATUS_COLOR[order.status]
                    )}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {order.items?.length ?? 0}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800">
                    ${order.totalAmount.toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {NEXT_STATUS[order.status] && (
                        <button
                          onClick={() => handleAdvance(order.id, order.status)}
                          disabled={updating}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                        >
                          <ArrowRight size={12} />
                          {ORDER_STATUS_LABEL[NEXT_STATUS[order.status]!]}
                        </button>
                      )}
                      {!isFinalStatus(order.status) && (
                        <button
                          onClick={() => { setCancelTarget(order.id); setCancelReason(""); }}
                          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <X size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && orders.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–{(meta.pageNumber - 1) * PAGE_SIZE + orders.length} of {meta.totalCount} orders
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

      {/* Cancel confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-gray-800">Cancel order?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Order <span className="font-mono font-medium">#{shortId(cancelTarget)}</span> will be cancelled.
            </p>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Reason <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
