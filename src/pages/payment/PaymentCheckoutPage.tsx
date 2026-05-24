import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  useInitiatePaymentMutation,
  useConfirmDirectPaymentMutation,
  useGetActivePaymentGatewaysQuery,
} from "@/features/payment/paymentApi";
import { useGetMyOrderByIdQuery } from "@/features/orders/ordersApi";
import type { TPaymentGateway } from "@/types/payment";
import { Skeleton } from "@/components/ui/Skeleton";
import { PATHS } from "@/routes/paths";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/utils/cn";

const CARD_OPTIONS = {
  style: {
    base: { fontSize: "14px", color: "#374151", fontFamily: "inherit", "::placeholder": { color: "#9ca3af" } },
    invalid: { color: "#ef4444" },
  },
};

// ─── Stripe card form ────────────────────────────────────────────────────────

function StripeCardForm({
  orderId,
  gateway,
  clientSecret,
  amount,
  onSuccess,
  onBack,
}: {
  orderId: string;
  gateway: string;
  clientSecret: string;
  amount: number;
  onSuccess: (txId: string) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirmDirectPayment] = useConfirmDirectPaymentMutation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) { setBusy(false); return; }

    const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (stripeErr) { setError(stripeErr.message ?? "Payment failed."); setBusy(false); return; }

    if (paymentIntent?.status === "succeeded") {
      try {
        const res = await confirmDirectPayment({ orderId, gateway }).unwrap();
        onSuccess(res.data?.id ?? "");
      } catch {
        toast.error("Payment processed but confirmation failed. Contact support.");
      }
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handlePay} className="space-y-3">
        <div className="rounded-md border border-gray-300 px-3 py-3">
          <CardElement options={CARD_OPTIONS} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={!stripe || busy}
          className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {busy ? "Processing…" : `Pay $${amount.toFixed(2)}`}
        </button>
      </form>
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
        <ArrowLeft size={12} /> Choose a different payment method
      </button>
      <p className="text-center text-xs text-gray-400">Secured by Stripe</p>
    </div>
  );
}

// ─── bKash manual form ────────────────────────────────────────────────────────

function BKashForm({
  orderId,
  gateway,
  merchantNumber,
  amount,
  onSuccess,
  onBack,
}: {
  orderId: string;
  gateway: string;
  merchantNumber: string;
  amount: number;
  onSuccess: (txId: string) => void;
  onBack: () => void;
}) {
  const [confirmDirectPayment, { isLoading }] = useConfirmDirectPaymentMutation();
  const [txnRef, setTxnRef] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!txnRef.trim()) { toast.error("Please enter your bKash Transaction ID"); return; }
    try {
      const res = await confirmDirectPayment({ orderId, gateway, transactionRef: txnRef.trim() }).unwrap();
      onSuccess(res.data?.id ?? "");
    } catch {
      toast.error("Failed to confirm payment. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-pink-200 bg-pink-50 p-4 text-center">
        <p className="mb-1 text-xs text-pink-500">Send ${amount.toFixed(2)} to</p>
        <p className="font-mono text-2xl font-bold tracking-wide text-pink-700">{merchantNumber}</p>
        <p className="mt-1 text-xs text-pink-400">bKash Personal / Merchant Number</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">bKash Transaction ID</label>
        <input
          value={txnRef}
          onChange={(e) => setTxnRef(e.target.value.toUpperCase())}
          placeholder="e.g. 8N5PB74G3N"
          className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
        />
        <p className="mt-0.5 text-xs text-gray-400">Found in bKash app → Transaction History.</p>
      </div>
      <button
        type="submit"
        disabled={isLoading || !txnRef.trim()}
        className="w-full rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
      >
        {isLoading ? "Submitting…" : `Confirm Payment — $${amount.toFixed(2)}`}
      </button>
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
        <ArrowLeft size={12} /> Choose a different payment method
      </button>
    </form>
  );
}

// ─── Gateway icon ─────────────────────────────────────────────────────────────

function GatewayIcon({ provider }: { provider: string }) {
  if (provider === "stripe") return <CreditCard size={20} className="text-blue-500" />;
  return <Smartphone size={20} className="text-pink-500" />;
}

function gatewayDescription(slug: string) {
  if (slug === "stripe_payment_intents") return "Credit / Debit Card";
  if (slug === "bkash_checkout") return "Mobile Banking (Redirect)";
  return "Mobile Banking";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentCheckoutPage() {
  usePageTitle("Payment");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  const { data: orderData, isLoading: loadingOrder } = useGetMyOrderByIdQuery(orderId, { skip: !orderId });
  const { data: gatewaysData, isLoading: loadingGateways } = useGetActivePaymentGatewaysQuery();
  const [initiatePayment, { isLoading: initiating }] = useInitiatePaymentMutation();

  const order = orderData?.data;
  const gateways = gatewaysData?.data ?? [];

  // Step tracking
  const [selectedGateway, setSelectedGateway] = useState<TPaymentGateway | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [merchantNumber, setMerchantNumber] = useState<string | null>(null);

  const step = clientSecret ? "stripe" : merchantNumber ? "bkash" : "select";

  async function handleGatewaySelect(gw: TPaymentGateway) {
    setSelectedGateway(gw);
    try {
      const res = await initiatePayment({ orderId, gateway: gw.slug }).unwrap();
      const tx = res.data;
      if (!tx) return;

      if (tx.redirectUrl) {
        window.location.assign(tx.redirectUrl);
        return;
      }
      if (tx.clientSecret && tx.publishableKey) {
        setClientSecret(tx.clientSecret);
        setStripePromise(loadStripe(tx.publishableKey));
      } else if (tx.merchantNumber) {
        setMerchantNumber(tx.merchantNumber);
      }
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
      setSelectedGateway(null);
    }
  }

  function handleBack() {
    setClientSecret(null);
    setMerchantNumber(null);
    setStripePromise(null);
    setSelectedGateway(null);
  }

  function handleSuccess(txId: string) {
    navigate(PATHS.PAYMENT.SUCCESS + (txId ? `?txId=${txId}` : ""));
  }

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-gray-500">No order specified.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-md">

        {/* Back link */}
        <button
          onClick={() => navigate(PATHS.CUSTOMER.ORDERS)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={15} /> Back to orders
        </button>

        {/* Order summary card */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {loadingOrder ? (
            <Skeleton className="h-12" />
          ) : order ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Order</p>
                <p className="font-mono text-sm font-semibold text-gray-800">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Amount due</p>
                <p className="text-lg font-bold text-orange-500">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-500">Order not found.</p>
          )}
        </div>

        {/* Payment panel */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          {/* Step: Select gateway */}
          {step === "select" && (
            <div>
              <h1 className="mb-4 text-base font-semibold text-gray-800">Choose payment method</h1>
              {loadingGateways || initiating ? (
                <div className="space-y-2">
                  <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                </div>
              ) : gateways.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  No payment methods available. Please contact support.
                </p>
              ) : (
                <div className="space-y-2">
                  {gateways.map((gw) => (
                    <button
                      key={gw.id}
                      onClick={() => handleGatewaySelect(gw)}
                      disabled={initiating}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors",
                        "hover:border-orange-300 hover:bg-orange-50",
                        selectedGateway?.id === gw.id && initiating
                          ? "border-orange-300 bg-orange-50 opacity-70"
                          : "border-gray-200"
                      )}
                    >
                      <GatewayIcon provider={gw.provider} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{gw.name}</p>
                        <p className="text-xs text-gray-400">{gatewayDescription(gw.slug)}</p>
                      </div>
                      {gw.isSandbox && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">
                          Test
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step: Stripe card form */}
          {step === "stripe" && clientSecret && stripePromise && order && selectedGateway && (
            <div>
              <h1 className="mb-4 text-base font-semibold text-gray-800">Pay with card</h1>
              <Elements stripe={stripePromise}>
                <StripeCardForm
                  orderId={orderId}
                  gateway={selectedGateway.slug}
                  clientSecret={clientSecret}
                  amount={order.totalAmount}
                  onSuccess={handleSuccess}
                  onBack={handleBack}
                />
              </Elements>
            </div>
          )}

          {/* Step: bKash manual form */}
          {step === "bkash" && merchantNumber && order && selectedGateway && (
            <div>
              <h1 className="mb-4 text-base font-semibold text-gray-800">Pay with bKash</h1>
              <BKashForm
                orderId={orderId}
                gateway={selectedGateway.slug}
                merchantNumber={merchantNumber}
                amount={order.totalAmount}
                onSuccess={handleSuccess}
                onBack={handleBack}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
