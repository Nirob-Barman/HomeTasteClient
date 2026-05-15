import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CreditCard, RefreshCw, RotateCcw } from "lucide-react";
import {
  useGetAllPaymentsQuery,
  useRefundPaymentMutation,
} from "@/features/payment/paymentApi";
import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  type TPaymentStatus,
  type TPaymentTransaction,
} from "@/types/payment";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 15;

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default function PaymentsPage() {
  usePageTitle("Payments");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TPaymentStatus | undefined>();

  const { data, isLoading, isFetching, refetch } = useGetAllPaymentsQuery(
    { pageNumber: page, pageSize: PAGE_SIZE, status: statusFilter },
    { refetchOnMountOrArgChange: true },
  );
  const [refundPayment, { isLoading: refunding }] = useRefundPaymentMutation();

  const payments = data?.data?.data ?? [];
  const meta = data?.data?.metaData;

  async function handleRefund(payment: TPaymentTransaction) {
    if (!confirm(`Refund payment ${shortId(payment.id)} ($${payment.amount.toFixed(2)})?`)) return;
    try {
      await refundPayment({ id: payment.id }).unwrap();
      toast.success("Payment refunded");
    } catch {
      toast.error("Failed to refund payment");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Payments</h1>
            {meta && (
              <p className="mt-0.5 text-sm text-gray-500">{meta.totalCount} transactions</p>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
            className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-600 disabled:opacity-40"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter ?? ""}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value ? Number(e.target.value) as TPaymentStatus : undefined);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        >
          <option value="">All statuses</option>
          {Object.entries(PAYMENT_STATUS).map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Transaction", "Order", "Amount", "Status", "Gateway", "Ref", "Paid At", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <CreditCard size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">No payment transactions found.</p>
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    #{shortId(p.id)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    #{shortId(p.orderId)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ${p.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      PAYMENT_STATUS_COLOR[p.status]
                    )}>
                      {PAYMENT_STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.gateway ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {p.transactionRef ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(p.paidAt)}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === PAYMENT_STATUS.Success && (
                      <button
                        onClick={() => handleRefund(p)}
                        disabled={refunding}
                        title="Refund"
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                      >
                        <RotateCcw size={12} /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–
            {(meta.pageNumber - 1) * PAGE_SIZE + payments.length} of {meta.totalCount}
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
