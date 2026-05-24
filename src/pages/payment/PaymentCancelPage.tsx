import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { PATHS } from "@/routes/paths";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function PaymentCancelPage() {
  usePageTitle("Payment Cancelled");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("txId");
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <XCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h1 className="mb-2 text-lg font-bold text-gray-800">Payment Cancelled</h1>
        <p className="mb-1 text-sm text-gray-500">
          {reason === "verification_failed"
            ? "Payment verification failed. Please try again or contact support."
            : "Your payment was not completed."}
        </p>
        {txId && (
          <p className="mb-6 font-mono text-xs text-gray-400">
            Ref: {txId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <div className="space-y-2">
          <button
            onClick={() => navigate(PATHS.CUSTOMER.ORDERS)}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Back to Orders
          </button>
          {orderId && (
            <button
              onClick={() => navigate(`${PATHS.PAYMENT.CHECKOUT}?orderId=${orderId}`)}
              className="w-full rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
