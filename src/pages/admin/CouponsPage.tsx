import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponActiveMutation,
} from "@/features/coupons/couponsApi";
import type { TCoupon } from "@/types/coupon";
import { DISCOUNT_TYPE, DISCOUNT_TYPE_LABEL } from "@/types/coupon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/Skeleton";

const schema = z.object({
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  discountType: z.number().min(1).max(2),
  discountValue: z.number().positive("Must be positive"),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  isFirstOrderOnly: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type ModalMode = { type: "create" } | { type: "edit"; coupon: TCoupon };

const defaultValues: FormValues = {
  code: "",
  description: "",
  discountType: DISCOUNT_TYPE.Percentage,
  discountValue: 0,
  isActive: true,
  isFirstOrderOnly: false,
};

export default function CouponsPage() {
  usePageTitle("Coupons");
  const [modal, setModal] = useState<ModalMode | null>(null);

  const { data, isLoading } = useGetCouponsQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [toggleActive] = useToggleCouponActiveMutation();

  const coupons = data?.data?.data ?? [];
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  function openCreate() {
    reset(defaultValues);
    setModal({ type: "create" });
  }

  function openEdit(coupon: TCoupon) {
    reset({
      code: coupon.code ?? "",
      description: coupon.description ?? "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount ?? undefined,
      maxDiscountAmount: coupon.maxDiscountAmount ?? undefined,
      usageLimit: coupon.usageLimit ?? undefined,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      isActive: coupon.isActive,
      isFirstOrderOnly: coupon.isFirstOrderOnly,
    });
    setModal({ type: "edit", coupon });
  }

  function closeModal() {
    setModal(null);
    reset(defaultValues);
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      description: values.description || undefined,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
    };
    try {
      if (modal?.type === "edit") {
        await updateCoupon({ id: modal.coupon.id, ...payload }).unwrap();
        toast.success("Coupon updated");
      } else {
        await createCoupon(payload as Parameters<typeof createCoupon>[0]).unwrap();
        toast.success("Coupon created");
      }
      closeModal();
    } catch {
      toast.error("Failed to save coupon");
    }
  }

  async function handleDelete(coupon: TCoupon) {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await deleteCoupon(coupon.id).unwrap();
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  }

  async function handleToggle(coupon: TCoupon) {
    try {
      await toggleActive(coupon.id).unwrap();
    } catch {
      toast.error("Failed to toggle coupon");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Coupons</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Create and manage discount coupons
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Add Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Tag size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No coupons yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click "Add Coupon" to create the first discount code
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Active", ""].map((h) => (
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
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-800">
                    {c.code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {DISCOUNT_TYPE_LABEL[c.discountType]}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.discountType === DISCOUNT_TYPE.Percentage
                      ? `${c.discountValue}%`
                      : `$${c.discountValue.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.minOrderAmount != null ? `$${c.minOrderAmount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.usageCount}
                    {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        c.isActive ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white shadow transition-transform ${
                          c.isActive ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                {modal.type === "create" ? "Add Coupon" : "Edit Coupon"}
              </h2>
              <button onClick={closeModal} className="rounded p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("code")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    placeholder="SAVE20"
                  />
                  {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Discount Type</label>
                  <select
                    {...register("discountType", { valueAsNumber: true })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option value={DISCOUNT_TYPE.Percentage}>Percentage</option>
                    <option value={DISCOUNT_TYPE.Flat}>Flat Amount</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("discountValue", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue.message}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Min Order ($)</label>
                  <input
                    {...register("minOrderAmount", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Max Discount ($)</label>
                  <input
                    {...register("maxDiscountAmount", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Usage Limit</label>
                  <input
                    {...register("usageLimit", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Expires At</label>
                  <input
                    {...register("expiresAt")}
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                  <input
                    {...register("description")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" {...register("isActive")} className="accent-orange-500" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" {...register("isFirstOrderOnly")} className="accent-orange-500" />
                  First order only
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : modal.type === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
