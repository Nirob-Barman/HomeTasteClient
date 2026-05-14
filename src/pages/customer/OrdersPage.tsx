import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetMyOrdersQuery } from "@/features/orders/ordersApi";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type TOrder } from "@/types/order";
import { PATHS } from "@/routes/paths";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const PAGE_SIZE = 10;

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function OrderRow({ order }: { order: TOrder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-gray-50"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <p className="font-mono text-sm font-medium text-gray-800">#{shortId(order.id)}</p>
          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              ORDER_STATUS_COLOR[order.status]
            )}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
          ${order.totalAmount.toFixed(2)}
        </td>
        <td className="px-4 py-3 text-right">
          {expanded ? (
            <ChevronUp size={16} className="ml-auto text-gray-400" />
          ) : (
            <ChevronDown size={16} className="ml-auto text-gray-400" />
          )}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-4 pb-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Items */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Items
                </p>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-orange-50">
                        {item.mealImageUrl ? (
                          <img
                            src={item.mealImageUrl}
                            alt={item.mealName ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-base">🍽️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {item.mealName ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order info */}
              <div className="space-y-2 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Details
                </p>
                {order.addressSummary && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery to</span>
                    <span className="text-right text-gray-700 max-w-[60%]">
                      {order.addressSummary}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-700">${order.subTotal.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-emerald-600">−${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-700">${order.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
                  <span className="text-gray-700">Total</span>
                  <span className="text-orange-500">${order.totalAmount.toFixed(2)}</span>
                </div>
                {order.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notes</span>
                    <span className="text-right text-gray-700 max-w-[60%]">{order.notes}</span>
                  </div>
                )}
                {order.estimatedDeliveryAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. delivery</span>
                    <span className="text-gray-700">{formatDate(order.estimatedDeliveryAt)}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered</span>
                    <span className="text-gray-700">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
                {order.cancellationReason && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cancel reason</span>
                    <span className="text-right text-red-500 max-w-[60%]">
                      {order.cancellationReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CustomerOrdersPage() {
  usePageTitle("My Orders");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetMyOrdersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  const orders = data?.data?.data ?? [];
  const meta = data?.data?.metaData;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">My Orders</h1>
        {meta && (
          <p className="mt-0.5 text-sm text-gray-500">{meta.totalCount} orders</p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <ShoppingBag size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">No orders yet.</p>
                  <button
                    onClick={() => navigate(PATHS.CUSTOMER.MEALS)}
                    className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    Browse Meals
                  </button>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && orders.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–
            {(meta.pageNumber - 1) * PAGE_SIZE + orders.length} of {meta.totalCount} orders
          </span>
          <div className={cn("flex items-center gap-1", isFetching && "opacity-60")}>
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
    </div>
  );
}
