import { useState } from "react";
import { ChevronLeft, ChevronRight, Truck, Star, ToggleLeft, ToggleRight, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useGetPersonnelQuery,
  useToggleAvailabilityMutation,
  useAssignDeliveryMutation,
} from "@/features/delivery/deliveryApi";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const PAGE_SIZE = 15;

const assignSchema = z.object({
  orderId: z.string().uuid("Must be a valid order ID"),
  deliveryPersonnelId: z.string().min(1, "Select a delivery person"),
});
type AssignForm = z.infer<typeof assignSchema>;

export default function DeliveriesPage() {
  usePageTitle("Deliveries");
  const [page, setPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data, isLoading, isFetching } = useGetPersonnelQuery({ pageNumber: page, pageSize: PAGE_SIZE });
  const [toggleAvailability, { isLoading: toggling }] = useToggleAvailabilityMutation();
  const [assignDelivery, { isLoading: assigning }] = useAssignDeliveryMutation();

  const personnel = data?.data?.data ?? [];
  const meta = data?.data?.metaData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignForm>({ resolver: zodResolver(assignSchema) });

  async function handleToggle(id: string, name: string | null) {
    try {
      await toggleAvailability(id).unwrap();
      toast.success(`${name ?? "Personnel"} availability updated`);
    } catch {
      toast.error("Failed to update availability");
    }
  }

  async function onAssignSubmit(values: AssignForm) {
    try {
      await assignDelivery(values).unwrap();
      toast.success("Delivery assigned successfully");
      setShowAssignModal(false);
      reset();
    } catch {
      toast.error("Failed to assign delivery");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Deliveries</h1>
          {meta && (
            <p className="mt-0.5 text-sm text-gray-500">{meta.totalCount} delivery personnel</p>
          )}
        </div>
        <button
          onClick={() => { setShowAssignModal(true); reset(); }}
          className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Assign Delivery
        </button>
      </div>

      {/* Personnel table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Personnel</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Deliveries</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : personnel.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No delivery personnel found.
                </td>
              </tr>
            ) : (
              personnel.map((p) => (
                <tr
                  key={p.id}
                  className={cn("transition-colors hover:bg-gray-50", isFetching && "opacity-60")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                        <Truck size={15} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.fullName ?? "—"}</p>
                        <p className="text-xs text-gray-400">{p.phone ?? "—"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    <div>
                      <p>{p.vehicleType ?? "—"}</p>
                      {p.vehicleNumber && (
                        <p className="text-xs text-gray-400">{p.vehicleNumber}</p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-gray-700">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" />
                      {p.rating.toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-600">{p.totalDeliveries}</td>

                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      p.isAvailable
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {p.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleToggle(p.id, p.fullName)}
                        disabled={toggling}
                        title={p.isAvailable ? "Mark unavailable" : "Mark available"}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {p.isAvailable
                          ? <><ToggleRight size={14} className="text-emerald-500" /> Available</>
                          : <><ToggleLeft size={14} className="text-gray-400" /> Unavailable</>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && personnel.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–{(meta.pageNumber - 1) * PAGE_SIZE + personnel.length} of {meta.totalCount} personnel
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

      {/* Assign delivery modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800">Assign Delivery</h2>
              <button
                onClick={() => { setShowAssignModal(false); reset(); }}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onAssignSubmit)} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("orderId")}
                  type="text"
                  placeholder="Paste order UUID"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                {errors.orderId && (
                  <p className="mt-1 text-xs text-red-500">{errors.orderId.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Delivery Personnel <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("deliveryPersonnelId")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                >
                  <option value="">Select personnel…</option>
                  {personnel
                    .filter((p) => p.isAvailable)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} — {p.vehicleType ?? "—"}
                      </option>
                    ))}
                </select>
                {errors.deliveryPersonnelId && (
                  <p className="mt-1 text-xs text-red-500">{errors.deliveryPersonnelId.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">Only available personnel are listed.</p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowAssignModal(false); reset(); }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {assigning ? "Assigning…" : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
