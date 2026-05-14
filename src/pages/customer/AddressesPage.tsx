import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/features/address/addressApi";
import type { TAddress } from "@/types/address";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/utils/usePageTitle";

const addressSchema = z.object({
  label: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean(),
});
type AddressForm = z.infer<typeof addressSchema>;

function AddressFormFields({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<AddressForm>>["register"];
  errors: ReturnType<typeof useForm<AddressForm>>["formState"]["errors"];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <input
          {...register("label")}
          placeholder="Label (e.g. Home, Work)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>
      <div className="col-span-2">
        <input
          {...register("addressLine1")}
          placeholder="Address line 1 *"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-xs text-red-500">{errors.addressLine1.message}</p>
        )}
      </div>
      <div className="col-span-2">
        <input
          {...register("addressLine2")}
          placeholder="Address line 2"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>
      <div>
        <input
          {...register("city")}
          placeholder="City *"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
      </div>
      <div>
        <input
          {...register("state")}
          placeholder="State"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>
      <div>
        <input
          {...register("postalCode")}
          placeholder="Postal code"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>
      <div>
        <input
          {...register("country")}
          placeholder="Country *"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
      </div>
      <div className="col-span-2">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" {...register("isDefault")} className="accent-orange-500" />
          Set as default address
        </label>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  usePageTitle("Addresses");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<TAddress | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useGetAddressesQuery();
  const [createAddress, { isLoading: creating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation();
  const [setDefault, { isLoading: settingDefault }] = useSetDefaultAddressMutation();

  const addresses = data?.data ?? [];

  const addForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  const editForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  function openEdit(addr: TAddress) {
    setEditingAddress(addr);
    editForm.reset({
      label: addr.label ?? "",
      addressLine1: addr.addressLine1 ?? "",
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      postalCode: addr.postalCode ?? "",
      country: addr.country ?? "",
      isDefault: addr.isDefault,
    });
  }

  async function handleAdd(values: AddressForm) {
    try {
      await createAddress(values).unwrap();
      toast.success("Address added");
      setShowAddModal(false);
      addForm.reset({ isDefault: false });
    } catch {
      toast.error("Failed to add address");
    }
  }

  async function handleUpdate(values: AddressForm) {
    if (!editingAddress) return;
    try {
      await updateAddress({ id: editingAddress.id, ...values }).unwrap();
      toast.success("Address updated");
      setEditingAddress(null);
    } catch {
      toast.error("Failed to update address");
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deleteAddress(deletingId).unwrap();
      toast.success("Address deleted");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete address");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefault(id).unwrap();
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to set default");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Addresses</h1>
          <p className="mt-0.5 text-sm text-gray-500">{addresses.length} saved address{addresses.length !== 1 ? "es" : ""}</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); addForm.reset({ isDefault: false }); }}
          className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Add Address
        </button>
      </div>

      {/* Address list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <MapPin size={36} className="mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">No addresses yet. Add one to start ordering.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "flex items-start justify-between rounded-xl border bg-white p-4",
                addr.isDefault ? "border-orange-300" : "border-gray-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  addr.isDefault ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-gray-400"
                )}>
                  <MapPin size={15} />
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    {addr.label && (
                      <span className="font-semibold text-gray-800">{addr.label}</span>
                    )}
                    {addr.isDefault && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-gray-600">
                    {[addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-gray-500">
                    {[addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={settingDefault}
                    title="Set as default"
                    className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-orange-500 disabled:opacity-50"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  onClick={() => openEdit(addr)}
                  className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-blue-500"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeletingId(addr.id)}
                  className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800">Add Address</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
              >✕</button>
            </div>
            <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4 p-5">
              <AddressFormFields register={addForm.register} errors={addForm.formState.errors} />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >{creating ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800">Edit Address</h2>
              <button
                onClick={() => setEditingAddress(null)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
              >✕</button>
            </div>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4 p-5">
              <AddressFormFields register={editForm.register} errors={editForm.formState.errors} />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >{updating ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl">
            <div className="px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800">Delete Address</h2>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete this address? This cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
