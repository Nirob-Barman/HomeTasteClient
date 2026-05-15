import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Globe, Pencil, Trash2, Plus } from "lucide-react";
import {
  useGetDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
} from "@/features/deliveryZones/deliveryZonesApi";
import type { TDeliveryZone } from "@/types/deliveryZone";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
  allowedCities: z.string(),
  allowedPostalCodes: z.string(),
});
type FormData = z.infer<typeof schema>;

function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ZoneModal({ zone, onClose }: { zone: TDeliveryZone | null; onClose: () => void }) {
  const [create, { isLoading: creating }] = useCreateDeliveryZoneMutation();
  const [update, { isLoading: updating }] = useUpdateDeliveryZoneMutation();
  const busy = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: zone?.name ?? "",
      description: zone?.description ?? "",
      isActive: zone?.isActive ?? true,
      allowedCities: zone?.allowedCities.join(", ") ?? "",
      allowedPostalCodes: zone?.allowedPostalCodes.join(", ") ?? "",
    },
  });

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      isActive: data.isActive,
      allowedCities: splitList(data.allowedCities),
      allowedPostalCodes: splitList(data.allowedPostalCodes),
    };
    try {
      if (zone) {
        await update({ id: zone.id, ...payload }).unwrap();
        toast.success("Zone updated");
      } else {
        await create(payload).unwrap();
        toast.success("Zone created");
      }
      onClose();
    } catch {
      toast.error("Failed to save zone");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          {zone ? "Edit Delivery Zone" : "New Delivery Zone"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Name *</label>
            <input
              {...register("name")}
              placeholder="e.g. Downtown Zone"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <input
              {...register("description")}
              placeholder="Optional description"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Allowed Cities <span className="text-gray-400">(comma-separated)</span>
            </label>
            <input
              {...register("allowedCities")}
              placeholder="e.g. New York, Brooklyn, Queens"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Allowed Postal Codes <span className="text-gray-400">(comma-separated)</span>
            </label>
            <input
              {...register("allowedPostalCodes")}
              placeholder="e.g. 10001, 10002, 11201"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" {...register("isActive")} className="accent-orange-500" />
            Active
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DeliveryZonesPage() {
  usePageTitle("Delivery Zones");
  const [editing, setEditing] = useState<TDeliveryZone | null | undefined>(undefined);
  const [deleteZone] = useDeleteDeliveryZoneMutation();

  const { data, isLoading } = useGetDeliveryZonesQuery();
  const zones = data?.data ?? [];

  function handleDelete(zone: TDeliveryZone) {
    toast(`Delete zone "${zone.name}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteZone(zone.id).unwrap();
            toast.success("Zone deleted");
          } catch {
            toast.error("Failed to delete zone");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Delivery Zones</h1>
          <p className="mt-0.5 text-sm text-gray-500">{zones.length} zone{zones.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Add Zone
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Status", "Cities", "Postal Codes", ""].map((h) => (
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
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : zones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <Globe size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">No delivery zones configured.</p>
                  <p className="mt-1 text-xs text-gray-400">All areas are served until a zone is added.</p>
                </td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{zone.name}</p>
                    {zone.description && (
                      <p className="text-xs text-gray-400">{zone.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        zone.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {zone.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {zone.allowedCities.length > 0
                      ? zone.allowedCities.join(", ")
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {zone.allowedPostalCodes.length > 0
                      ? zone.allowedPostalCodes.join(", ")
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(zone)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-orange-300 hover:text-orange-500"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(zone)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-red-300 hover:text-red-500"
                      >
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

      {editing !== undefined && (
        <ZoneModal zone={editing} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
