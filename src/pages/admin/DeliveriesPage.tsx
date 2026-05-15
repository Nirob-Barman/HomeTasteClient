import { useState } from "react";
import { ChevronLeft, ChevronRight, Truck, Star, ToggleLeft, ToggleRight, Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useGetPersonnelQuery,
  useToggleAvailabilityMutation,
  useAssignDeliveryMutation,
  useCreatePersonnelMutation,
  useUpdatePersonnelMutation,
  useDeletePersonnelMutation,
} from "@/features/delivery/deliveryApi";
import type { TDeliveryPersonnel } from "@/types/delivery";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const PAGE_SIZE = 15;

const personnelSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  userId: z.string().optional(),
});
type PersonnelForm = z.infer<typeof personnelSchema>;

const assignSchema = z.object({
  orderId: z.string().uuid("Must be a valid order ID"),
  deliveryPersonnelId: z.string().min(1, "Select a delivery person"),
});
type AssignForm = z.infer<typeof assignSchema>;

function PersonnelModal({ personnel, onClose }: { personnel: TDeliveryPersonnel | null; onClose: () => void }) {
  const [create, { isLoading: creating }] = useCreatePersonnelMutation();
  const [update, { isLoading: updating }] = useUpdatePersonnelMutation();
  const busy = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<PersonnelForm>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      fullName: personnel?.fullName ?? "",
      phone: personnel?.phone ?? "",
      vehicleType: personnel?.vehicleType ?? "",
      vehicleNumber: personnel?.vehicleNumber ?? "",
      userId: personnel?.userId ?? "",
    },
  });

  async function onSubmit(data: PersonnelForm) {
    const payload = {
      fullName: data.fullName,
      phone: data.phone || undefined,
      vehicleType: data.vehicleType || undefined,
      vehicleNumber: data.vehicleNumber || undefined,
      userId: data.userId || undefined,
    };
    try {
      if (personnel) {
        await update({ id: personnel.id, ...payload }).unwrap();
        toast.success("Personnel updated");
      } else {
        await create(payload).unwrap();
        toast.success("Personnel added");
      }
      onClose();
    } catch {
      toast.error("Failed to save personnel");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          {personnel ? "Edit Personnel" : "Add Delivery Personnel"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
            <input {...register("fullName")} placeholder="e.g. John Doe" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
            {errors.fullName && <p className="mt-0.5 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Phone</label>
            <input {...register("phone")} placeholder="e.g. +1 555 0100" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Vehicle Type</label>
              <input {...register("vehicleType")} placeholder="e.g. Bike" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Vehicle No.</label>
              <input {...register("vehicleNumber")} placeholder="e.g. ABC-123" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
            </div>
          </div>
          {!personnel && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">User ID <span className="text-gray-400">(optional)</span></label>
              <input {...register("userId")} placeholder="Link to existing user account" className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-orange-400 focus:outline-none" />
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60">
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DeliveriesPage() {
  usePageTitle("Deliveries");
  const [page, setPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<TDeliveryPersonnel | null | undefined>(undefined);

  const { data, isLoading, isFetching } = useGetPersonnelQuery({ pageNumber: page, pageSize: PAGE_SIZE });
  const [toggleAvailability, { isLoading: toggling }] = useToggleAvailabilityMutation();
  const [assignDelivery, { isLoading: assigning }] = useAssignDeliveryMutation();
  const [deletePersonnel] = useDeletePersonnelMutation();

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

  function handleDelete(p: TDeliveryPersonnel) {
    toast(`Remove "${p.fullName ?? "this personnel"}"?`, {
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            await deletePersonnel(p.id).unwrap();
            toast.success("Personnel removed");
          } catch {
            toast.error("Failed to remove personnel");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingPersonnel(null)}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus size={15} /> Add Personnel
          </button>
          <button
            onClick={() => { setShowAssignModal(true); reset(); }}
            className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Truck size={15} /> Assign Delivery
          </button>
        </div>
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
                    <div className="flex items-center justify-end gap-2">
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
                      <button onClick={() => setEditingPersonnel(p)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-orange-300 hover:text-orange-500">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(p)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-red-300 hover:text-red-500">
                        <Trash2 size={13} />
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

      {/* Personnel create/edit modal */}
      {editingPersonnel !== undefined && (
        <PersonnelModal personnel={editingPersonnel} onClose={() => setEditingPersonnel(undefined)} />
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
