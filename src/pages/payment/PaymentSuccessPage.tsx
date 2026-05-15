import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { PATHS } from "@/routes/paths";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function PaymentSuccessPage() {
  usePageTitle("Payment Successful");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get("txId");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
        <h1 className="mb-2 text-lg font-bold text-gray-800">Payment Successful</h1>
        <p className="mb-1 text-sm text-gray-500">Your payment has been confirmed.</p>
        {txId && (
          <p className="mb-6 font-mono text-xs text-gray-400">
            Ref: {txId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <button
          onClick={() => navigate(PATHS.CUSTOMER.ORDERS)}
          className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          View My Orders
        </button>
      </div>
    </div>
  );
}
