import { useState } from "react";
import { toast } from "sonner";
import { Truck, MapPin, RefreshCw } from "lucide-react";
import { useGetMyDeliveriesQuery, useUpdateDeliveryStatusMutation, useUpdateLocationMutation } from "@/features/delivery/deliveryApi";
import { DELIVERY_STATUS, type TDeliveryStatus } from "@/types/delivery";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/utils/usePageTitle";

const STATUS_LABEL: Record<TDeliveryStatus, string> = {
  1: "Assigned",
  2: "Picked Up",
  3: "Delivered",
  4: "Failed",
};

const STATUS_COLOR: Record<TDeliveryStatus, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-emerald-100 text-emerald-700",
  4: "bg-red-100 text-red-600",
};

const NEXT_STATUS: Partial<Record<TDeliveryStatus, TDeliveryStatus>> = {
  [DELIVERY_STATUS.Assigned]: DELIVERY_STATUS.PickedUp,
  [DELIVERY_STATUS.PickedUp]: DELIVERY_STATUS.Delivered,
};

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default function AssignmentsPage() {
  usePageTitle("My Assignments");
  const [failingId, setFailingId] = useState<string | null>(null);
  const [failNotes, setFailNotes] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const { data, isLoading, refetch, isFetching } = useGetMyDeliveriesQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateDeliveryStatusMutation();
  const [updateLocation, { isLoading: updatingLocation }] = useUpdateLocationMutation();

  const assignments = data?.data ?? [];
  const personnelId = assignments[0]?.deliveryPersonnelId ?? null;

  async function handleAdvance(assignmentId: string, next: TDeliveryStatus) {
    try {
      await updateStatus({ assignmentId, status: next }).unwrap();
      toast.success(`Status updated to ${STATUS_LABEL[next]}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleFail() {
    if (!failingId) return;
    try {
      await updateStatus({ assignmentId: failingId, status: DELIVERY_STATUS.Failed, notes: failNotes || undefined }).unwrap();
      toast.success("Delivery marked as failed");
      setFailingId(null);
      setFailNotes("");
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleLocationUpdate() {
    if (!locationId) return;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error("Enter valid latitude and longitude");
      return;
    }
    try {
      await updateLocation({ id: locationId, latitude, longitude }).unwrap();
      toast.success("Location updated");
      setLocationId(null);
      setLat("");
      setLng("");
    } catch {
      toast.error("Failed to update location");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">My Assignments</h1>
          <p className="mt-0.5 text-sm text-gray-500">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {personnelId && (
            <button
              onClick={() => setLocationId(locationId ? null : personnelId)}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <MapPin size={14} className="text-orange-500" /> Update Location
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* GPS location update panel */}
      {locationId && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="mb-3 text-sm font-medium text-orange-700">Update GPS Location</p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Latitude</label>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g. 23.8103"
                className="w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Longitude</label>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g. 90.4125"
                className="w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <button
              onClick={handleLocationUpdate}
              disabled={updatingLocation}
              className="rounded-md bg-orange-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {updatingLocation ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setLocationId(null); setLat(""); setLng(""); }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Assignments list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Truck size={36} className="mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">No assignments yet.</p>
        </div>
      ) : (
        <div className={cn("space-y-3", isFetching && "opacity-70")}>
          {assignments.map((a) => {
            const next = NEXT_STATUS[a.status as TDeliveryStatus];
            const isFinal = a.status === DELIVERY_STATUS.Delivered || a.status === DELIVERY_STATUS.Failed;

            return (
              <div
                key={a.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Info */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                      <Truck size={16} />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">
                        Order <span className="font-mono">#{shortId(a.orderId)}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Assignment <span className="font-mono">#{shortId(a.id)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    STATUS_COLOR[a.status as TDeliveryStatus]
                  )}>
                    {STATUS_LABEL[a.status as TDeliveryStatus]}
                  </span>
                </div>

                {/* Timestamps */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 sm:grid-cols-3">
                  <div>
                    <span className="font-medium text-gray-600">Assigned</span>
                    <p>{formatDate(a.assignedAt)}</p>
                  </div>
                  {a.pickedUpAt && (
                    <div>
                      <span className="font-medium text-gray-600">Picked Up</span>
                      <p>{formatDate(a.pickedUpAt)}</p>
                    </div>
                  )}
                  {a.deliveredAt && (
                    <div>
                      <span className="font-medium text-gray-600">Delivered</span>
                      <p>{formatDate(a.deliveredAt)}</p>
                    </div>
                  )}
                  {a.notes && (
                    <div className="col-span-2 sm:col-span-3">
                      <span className="font-medium text-gray-600">Notes: </span>
                      {a.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isFinal && (
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    {next && (
                      <button
                        disabled={updating}
                        onClick={() => handleAdvance(a.id, next)}
                        className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                      >
                        → Mark as {STATUS_LABEL[next]}
                      </button>
                    )}
                    <button
                      disabled={updating}
                      onClick={() => { setFailingId(a.id); setFailNotes(""); }}
                      className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      Mark as Failed
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fail confirmation modal */}
      {failingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl">
            <div className="px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800">Mark as Failed</h2>
              <p className="mt-1 text-sm text-gray-500">Optionally add a reason before marking this delivery as failed.</p>
              <textarea
                value={failNotes}
                onChange={(e) => setFailNotes(e.target.value)}
                placeholder="Reason (optional)"
                rows={3}
                className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => setFailingId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >Cancel</button>
              <button
                disabled={updating}
                onClick={handleFail}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >{updating ? "Saving…" : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
