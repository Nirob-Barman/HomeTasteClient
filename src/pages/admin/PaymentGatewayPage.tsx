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
  Loader2,
} from "lucide-react";
import {
  useGetPaymentGatewaySchemaQuery,
  useGetPaymentGatewaysQuery,
  useCreatePaymentGatewayMutation,
  useUpdatePaymentGatewayMutation,
  useTogglePaymentGatewayMutation,
  useDeletePaymentGatewayMutation,
} from "@/features/payment/paymentApi";
import type {
  TPaymentGateway,
  TGatewayFamilyDef,
  TGatewayVariantDef,
  CreatePaymentGatewayRequest,
  UpdatePaymentGatewayRequest,
} from "@/types/payment";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

// ─── Modal ───────────────────────────────────────────────────────────────────

function GatewayModal({
  gateway,
  schema,
  onClose,
}: {
  gateway: TPaymentGateway | null;
  schema: TGatewayFamilyDef[];
  onClose: () => void;
}) {
  const isEdit = !!gateway;

  const defaultFamily = isEdit
    ? (schema.find((f) => f.key === gateway!.provider) ?? schema[0])
    : schema[0];
  const defaultVariant = isEdit
    ? (defaultFamily?.variants.find((v) => v.slug === gateway!.slug) ?? defaultFamily?.variants[0])
    : defaultFamily?.variants[0];

  const [family, setFamily] = useState<TGatewayFamilyDef>(defaultFamily ?? schema[0]);
  const [variant, setVariant] = useState<TGatewayVariantDef>(
    defaultVariant ?? defaultFamily?.variants[0],
  );
  const [name, setName] = useState(gateway?.name ?? `${defaultFamily?.displayName} ${defaultVariant?.variantLabel}`);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(gateway?.isActive ?? true);
  const [isSandbox, setIsSandbox] = useState(gateway?.isSandbox ?? true);

  const [createGateway, { isLoading: creating }] = useCreatePaymentGatewayMutation();
  const [updateGateway, { isLoading: updating }] = useUpdatePaymentGatewayMutation();
  const busy = creating || updating;

  function handleFamilyChange(f: TGatewayFamilyDef) {
    const v = f.variants[0];
    setFamily(f);
    setVariant(v);
    setName(`${f.displayName} ${v.variantLabel}`);
    setFields({});
  }

  function handleVariantChange(v: TGatewayVariantDef) {
    setVariant(v);
    setName(`${family.displayName} ${v.variantLabel}`);
    setFields({});
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Display name is required"); return; }

    // Validate required fields on create
    if (!isEdit) {
      for (const field of variant.fields) {
        if (field.isRequired && !fields[field.key]?.trim()) {
          toast.error(`${field.label} is required`);
          return;
        }
      }
    }

    try {
      if (isEdit) {
        const body: { id: string } & UpdatePaymentGatewayRequest = {
          id: gateway!.id,
          name: name.trim(),
          config: Object.fromEntries(
            Object.entries(fields).filter(([, v]) => v !== undefined),
          ),
          isActive,
          isSandbox,
        };
        await updateGateway(body).unwrap();
        toast.success("Gateway updated");
      } else {
        const body: CreatePaymentGatewayRequest = {
          name: name.trim(),
          slug: variant.slug,
          config: Object.fromEntries(
            Object.entries(fields).filter(([, v]) => v.trim() !== ""),
          ),
          isActive,
          isSandbox,
        };
        await createGateway(body).unwrap();
        toast.success("Gateway created");
      }
      onClose();
    } catch {
      toast.error(isEdit ? "Failed to update gateway" : "Failed to create gateway");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-base font-semibold text-gray-800">
          {isEdit ? `Edit — ${gateway!.name}` : "Add Payment Gateway"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Create: family + variant dropdowns */}
          {!isEdit && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Gateway <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={family.key}
                    onChange={(e) => {
                      const f = schema.find((f) => f.key === e.target.value)!;
                      handleFamilyChange(f);
                    }}
                    className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    {schema.map((f) => (
                      <option key={f.key} value={f.key}>{f.displayName}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {family.variants.length > 1 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Service Type <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={variant.slug}
                      onChange={(e) => {
                        const v = family.variants.find((v) => v.slug === e.target.value)!;
                        handleVariantChange(v);
                      }}
                      className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    >
                      {family.variants.map((v) => (
                        <option key={v.slug} value={v.slug}>{v.variantLabel}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Edit: read-only type indicator */}
          {isEdit && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
              <span className="font-medium text-gray-700">{defaultFamily?.displayName}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">{defaultVariant?.variantLabel}</span>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            {!isEdit && (
              <p className="mt-0.5 text-xs text-gray-400">
                All credentials are encrypted before storage.
              </p>
            )}
          </div>

          {/* Dynamic credential fields from schema */}
          {variant.fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {field.label}
                {field.isRequired && !isEdit && <span className="text-red-400"> *</span>}
                {isEdit && (
                  <span className="text-gray-400"> (leave blank to keep current)</span>
                )}
              </label>
              <input
                type={field.isSecret ? "password" : "text"}
                autoComplete={field.isSecret ? "new-password" : "off"}
                value={fields[field.key] ?? ""}
                onChange={(e) => setFields((f) => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          ))}

          {/* Active + Sandbox */}
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-orange-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isSandbox}
                onChange={(e) => setIsSandbox(e.target.checked)}
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

  const [modal, setModal] = useState<{ open: boolean; gateway: TPaymentGateway | null }>({
    open: false,
    gateway: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<TPaymentGateway | null>(null);

  const { data: schemaData, isLoading: schemaLoading } = useGetPaymentGatewaySchemaQuery();
  const { data, isLoading } = useGetPaymentGatewaysQuery();
  const [toggleGateway] = useTogglePaymentGatewayMutation();
  const [deleteGateway] = useDeletePaymentGatewayMutation();

  const schema = schemaData?.data ?? [];
  const gateways = data?.data ?? [];

  async function handleToggle(gw: TPaymentGateway) {
    if (!gw.isConfigured && !gw.isActive) {
      toast.error(`${gw.name} has no credentials — configure it before activating`);
      return;
    }
    try {
      await toggleGateway(gw.id).unwrap();
      toast.success(`${gw.name} is now ${gw.isActive ? "inactive" : "active"}`);
    } catch {
      toast.error("Failed to toggle gateway");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteGateway(deleteTarget.id).unwrap();
      toast.success("Gateway deleted");
    } catch {
      toast.error("Failed to delete gateway");
    } finally {
      setDeleteTarget(null);
    }
  }

  function credentialSummary(gw: TPaymentGateway) {
    if (!gw.isConfigured)
      return <span className="text-xs text-red-400">Not configured</span>;
    if (gw.merchantNumber)
      return <span className="font-mono text-xs text-gray-500">{gw.merchantNumber}</span>;
    if (gw.publishableKeyHint)
      return <span className="font-mono text-xs text-gray-400">{gw.publishableKeyHint}</span>;
    return <span className="text-xs text-emerald-600">Configured</span>;
  }

  function variantLabel(gw: TPaymentGateway) {
    const family = schema.find((f) => f.key === gw.provider);
    const variant = family?.variants.find((v) => v.slug === gw.slug);
    return variant?.variantLabel ?? gw.slug;
  }

  const tableReady = !isLoading && !schemaLoading;

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
          disabled={schemaLoading || schema.length === 0}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
        >
          <Plus size={15} /> Add Gateway
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Gateway", "Slug", "Service Type", "Credential", "Mode", "Status", "Created", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!tableReady ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))
            ) : gateways.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <CreditCard size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">No payment gateways configured yet.</p>
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
                  <td className="px-4 py-3 font-semibold text-gray-800">{gw.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{gw.slug}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      gw.provider === "stripe"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-pink-100 text-pink-700",
                    )}>
                      {variantLabel(gw)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{credentialSummary(gw)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      gw.isSandbox ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700",
                    )}>
                      {gw.isSandbox ? "Sandbox" : "Live"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(gw)}
                      title={gw.isActive ? "Click to deactivate" : "Click to activate"}
                    >
                      {gw.isActive ? (
                        <CheckCircle2 size={18} className="text-emerald-500 hover:text-emerald-600" />
                      ) : (
                        <XCircle size={18} className="text-gray-300 hover:text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {gw.createdAt
                      ? new Date(gw.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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
                        onClick={() => setDeleteTarget(gw)}
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

      {/* Gateway create/edit modal */}
      {modal.open && schema.length > 0 && (
        <GatewayModal
          gateway={modal.gateway}
          schema={schema}
          onClose={() => setModal({ open: false, gateway: null })}
        />
      )}

      {/* Schema loading spinner (modal button disabled while loading) */}
      {modal.open && schemaLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-base font-semibold text-gray-800">Delete gateway?</h2>
            <p className="mb-5 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{deleteTarget.name}</span>{" "}
              will be permanently removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
