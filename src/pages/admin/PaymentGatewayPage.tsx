import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import {
  useGetPaymentGatewaysQuery,
  useCreatePaymentGatewayMutation,
  useUpdatePaymentGatewayMutation,
  useTogglePaymentGatewayMutation,
  useDeletePaymentGatewayMutation,
} from "@/features/payment/paymentApi";
import type {
  TPaymentGateway,
  CreatePaymentGatewayRequest,
  UpdatePaymentGatewayRequest,
} from "@/types/payment";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

// ─── Gateway catalogue ───────────────────────────────────────────────────────

type FieldKey = "publishableKey" | "secretKey" | "merchantNumber";

type ServiceType = {
  label: string;
  type: string;
  description: string;
  fields: FieldKey[];
  fieldLabels?: Partial<Record<FieldKey, string>>;
  fieldPlaceholders?: Partial<Record<FieldKey, string>>;
};

type GatewayProvider = {
  label: string;
  slug: string;
  serviceTypes: ServiceType[];
};

const GATEWAY_PROVIDERS: GatewayProvider[] = [
  {
    label: "Stripe",
    slug: "stripe",
    serviceTypes: [
      {
        label: "Card (Stripe)",
        type: "card",
        description: "Credit / debit card payments via Stripe API.",
        fields: ["publishableKey", "secretKey"],
        fieldPlaceholders: {
          publishableKey: "pk_test_...",
          secretKey: "sk_test_...",
        },
      },
    ],
  },
  {
    label: "bKash Manual",
    slug: "bkash",
    serviceTypes: [
      {
        label: "Manual (Transaction ID)",
        type: "manual",
        description:
          "Customer sends money via bKash app and provides their TXN ID.",
        fields: ["merchantNumber"],
        fieldPlaceholders: { merchantNumber: "e.g. 01XXXXXXXXX" },
      },
    ],
  },
  {
    label: "bKash Checkout",
    slug: "bkash-checkout",
    serviceTypes: [
      {
        label: "Checkout (API)",
        type: "checkout",
        description:
          "Redirect-based bKash Checkout — customer completes payment in bKash.",
        fields: ["publishableKey", "secretKey", "merchantNumber"],
        fieldLabels: {
          publishableKey: "App Key",
          secretKey: "App Secret",
          merchantNumber: "Username",
        },
        fieldPlaceholders: {
          publishableKey: "bKash App Key",
          secretKey: "bKash App Secret",
          merchantNumber: "bKash API Username",
        },
      },
    ],
  },
];

function findProvider(slug: string): GatewayProvider {
  return GATEWAY_PROVIDERS.find((p) => p.slug === slug) ?? GATEWAY_PROVIDERS[0];
}

function findServiceType(provider: GatewayProvider, type: string): ServiceType {
  return (
    provider.serviceTypes.find((s) => s.type === type) ??
    provider.serviceTypes[0]
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function GatewayModal({
  gateway,
  onClose,
}: {
  gateway: TPaymentGateway | null;
  onClose: () => void;
}) {
  const isEdit = !!gateway;

  const defaultProvider = isEdit
    ? findProvider(gateway!.slug)
    : GATEWAY_PROVIDERS[0];
  const defaultServiceType = isEdit
    ? findServiceType(defaultProvider, gateway!.gatewayType)
    : defaultProvider.serviceTypes[0];

  const [provider, setProvider] = useState<GatewayProvider>(defaultProvider);
  const [serviceType, setServiceType] =
    useState<ServiceType>(defaultServiceType);
  const [form, setForm] = useState({
    name:
      gateway?.name ?? `${defaultProvider.label} ${defaultServiceType.label}`,
    publishableKey: "",
    secretKey: "",
    merchantNumber: gateway?.merchantNumber ?? "",
    isActive: gateway?.isActive ?? true,
    isSandbox: gateway?.isSandbox ?? true,
  });

  const [createGateway, { isLoading: creating }] =
    useCreatePaymentGatewayMutation();
  const [updateGateway, { isLoading: updating }] =
    useUpdatePaymentGatewayMutation();
  const busy = creating || updating;

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleProviderChange(p: GatewayProvider) {
    const st = p.serviceTypes[0];
    setProvider(p);
    setServiceType(st);
    setForm((f) => ({
      ...f,
      name: `${p.label} ${st.label}`,
      publishableKey: "",
      secretKey: "",
      merchantNumber: "",
    }));
  }

  function handleServiceTypeChange(st: ServiceType) {
    setServiceType(st);
    setForm((f) => ({
      ...f,
      name: `${provider.label} ${st.label}`,
      publishableKey: "",
      secretKey: "",
      merchantNumber: "",
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Display name is required");
      return;
    }

    try {
      if (isEdit) {
        const body: { id: string } & UpdatePaymentGatewayRequest = {
          id: gateway!.id,
          name: form.name.trim(),
          isActive: form.isActive,
          isSandbox: form.isSandbox,
          ...(form.publishableKey.trim() && {
            publishableKey: form.publishableKey.trim(),
          }),
          ...(form.secretKey.trim() && { secretKey: form.secretKey.trim() }),
          merchantNumber: form.merchantNumber.trim() || undefined,
        };
        await updateGateway(body).unwrap();
        toast.success("Gateway updated");
      } else {
        const body: CreatePaymentGatewayRequest = {
          name: form.name.trim(),
          slug: provider.slug,
          gatewayType: serviceType.type,
          isActive: form.isActive,
          isSandbox: form.isSandbox,
          ...(form.publishableKey.trim() && {
            publishableKey: form.publishableKey.trim(),
          }),
          ...(form.secretKey.trim() && { secretKey: form.secretKey.trim() }),
          ...(form.merchantNumber.trim() && {
            merchantNumber: form.merchantNumber.trim(),
          }),
        };
        await createGateway(body).unwrap();
        toast.success("Gateway created");
      }
      onClose();
    } catch {
      toast.error(
        isEdit ? "Failed to update gateway" : "Failed to create gateway",
      );
    }
  }

  const showField = (f: ServiceType["fields"][number]) =>
    serviceType.fields.includes(f);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-base font-semibold text-gray-800">
          {isEdit ? `Edit — ${gateway!.name}` : "Add Payment Gateway"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Create: Gateway + Service Type dropdowns */}
          {!isEdit && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Gateway <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={provider.slug}
                    onChange={(e) => {
                      const p = GATEWAY_PROVIDERS.find(
                        (p) => p.slug === e.target.value,
                      )!;
                      handleProviderChange(p);
                    }}
                    className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    {GATEWAY_PROVIDERS.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Service Type <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={serviceType.type}
                    onChange={(e) => {
                      const st = provider.serviceTypes.find(
                        (s) => s.type === e.target.value,
                      )!;
                      handleServiceTypeChange(st);
                    }}
                    className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    {provider.serviceTypes.map((s) => (
                      <option key={s.type} value={s.type}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {serviceType.description}
                </p>
              </div>
            </>
          )}

          {/* Edit: read-only type indicator */}
          {isEdit && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
              <span className="font-medium text-gray-700">
                {defaultProvider.label}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">{defaultServiceType.label}</span>
              <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 font-mono text-gray-500">
                {gateway!.slug}
              </span>
            </div>
          )}

          {/* Display name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={`e.g. ${provider.label} ${serviceType.label}`}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            {!isEdit && (
              <p className="mt-0.5 text-xs text-gray-400">
                {provider.label} credentials — all values are encrypted before
                storage.
              </p>
            )}
          </div>

          {/* Publishable Key / App Key */}
          {showField("publishableKey") && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {serviceType.fieldLabels?.publishableKey ?? "Publishable Key"}
                {isEdit && (
                  <span className="text-gray-400">
                    {" "}
                    (leave blank to keep current)
                  </span>
                )}
              </label>
              <input
                value={form.publishableKey}
                onChange={(e) => set("publishableKey", e.target.value)}
                placeholder={
                  serviceType.fieldPlaceholders?.publishableKey ?? "pk_test_..."
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          )}

          {/* Secret Key / App Secret */}
          {showField("secretKey") && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {serviceType.fieldLabels?.secretKey ?? "Secret Key"}
                {isEdit && (
                  <span className="text-gray-400">
                    {" "}
                    (leave blank to keep current)
                  </span>
                )}
              </label>
              <input
                type="password"
                value={form.secretKey}
                onChange={(e) => set("secretKey", e.target.value)}
                placeholder={
                  serviceType.fieldPlaceholders?.secretKey ?? "sk_test_..."
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          )}

          {/* Merchant Number / Username */}
          {showField("merchantNumber") && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {serviceType.fieldLabels?.merchantNumber ?? "Merchant Number"}
              </label>
              <input
                value={form.merchantNumber}
                onChange={(e) => set("merchantNumber", e.target.value)}
                placeholder={
                  serviceType.fieldPlaceholders?.merchantNumber ??
                  "e.g. 01XXXXXXXXX"
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          )}

          {/* Active + Sandbox */}
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="accent-orange-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isSandbox}
                onChange={(e) => set("isSandbox", e.target.checked)}
                className="accent-orange-500"
              />
              Sandbox / Test mode
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {busy ? "Saving…" : isEdit ? "Save Changes" : "Create Gateway"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentGatewayPage() {
  usePageTitle("Payment Gateways");
  const [modal, setModal] = useState<{
    open: boolean;
    gateway: TPaymentGateway | null;
  }>({
    open: false,
    gateway: null,
  });

  const { data, isLoading } = useGetPaymentGatewaysQuery();
  const [toggleGateway] = useTogglePaymentGatewayMutation();
  const [deleteGateway] = useDeletePaymentGatewayMutation();

  const gateways = data?.data ?? [];

  async function handleToggle(gw: TPaymentGateway) {
    try {
      await toggleGateway(gw.id).unwrap();
      toast.success(`${gw.name} is now ${gw.isActive ? "inactive" : "active"}`);
    } catch {
      toast.error("Failed to toggle gateway");
    }
  }

  function handleDelete(gw: TPaymentGateway) {
    toast(`Delete gateway "${gw.name}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteGateway(gw.id).unwrap();
            toast.success("Gateway deleted");
          } catch {
            toast.error("Failed to delete gateway");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  }

  function credentialSummary(gw: TPaymentGateway) {
    if (!gw.isConfigured)
      return <span className="text-xs text-red-400">Not set</span>;
    if (gw.gatewayType === "manual") {
      return gw.merchantNumber ? (
        <span className="font-mono text-xs text-gray-500">
          {gw.merchantNumber}
        </span>
      ) : (
        <span className="text-xs text-amber-500">No merchant number</span>
      );
    }
    if (gw.gatewayType === "checkout") {
      return gw.publishableKeyHint ? (
        <span className="font-mono text-xs text-gray-400">
          {gw.publishableKeyHint} (App Key)
        </span>
      ) : (
        <span className="text-xs text-amber-500">No App Key</span>
      );
    }
    return gw.publishableKeyHint ? (
      <span className="font-mono text-xs text-gray-400">
        {gw.publishableKeyHint}
      </span>
    ) : (
      <span className="text-xs text-amber-500">Configured</span>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Payment Gateways</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure payment processors used at checkout.
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, gateway: null })}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Add Gateway
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Gateway",
                "Slug",
                "Service Type",
                "Credential",
                "Mode",
                "Status",
                "Created",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : gateways.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <CreditCard
                    size={32}
                    className="mx-auto mb-3 text-gray-300"
                  />
                  <p className="text-sm text-gray-400">
                    No payment gateways configured yet.
                  </p>
                  <button
                    onClick={() => setModal({ open: true, gateway: null })}
                    className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    Add First Gateway
                  </button>
                </td>
              </tr>
            ) : (
              gateways.map((gw) => (
                <tr key={gw.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {gw.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {gw.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        gw.gatewayType === "manual"
                          ? "bg-pink-100 text-pink-700"
                          : gw.gatewayType === "checkout"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700",
                      )}
                    >
                      {gw.gatewayType === "manual"
                        ? "Manual"
                        : gw.gatewayType === "checkout"
                          ? "Checkout"
                          : "Card"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{credentialSummary(gw)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        gw.isSandbox
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-emerald-100 text-emerald-700",
                      )}
                    >
                      {gw.isSandbox ? "Sandbox" : "Live"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(gw)}
                      title={
                        gw.isActive
                          ? "Click to deactivate"
                          : "Click to activate"
                      }
                    >
                      {gw.isActive ? (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-500 hover:text-emerald-600"
                        />
                      ) : (
                        <XCircle
                          size={18}
                          className="text-gray-300 hover:text-gray-400"
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {gw.createdAt
                      ? new Date(gw.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ open: true, gateway: gw })}
                        className="rounded p-1 text-gray-400 hover:text-orange-500"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(gw)}
                        className="rounded p-1 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <GatewayModal
          gateway={modal.gateway}
          onClose={() => setModal({ open: false, gateway: null })}
        />
      )}
    </div>
  );
}
