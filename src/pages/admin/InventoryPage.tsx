import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import {
  useGetInventoryQuery,
  useAddInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from "@/features/inventory/inventoryApi";
import type { TInventoryItem } from "@/types/inventory";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/Skeleton";

const addSchema = z.object({
  name: z.string().min(1, "Name is required"),
  stockCount: z.number().int().min(0, "Stock must be 0 or more"),
  price: z.number().min(0, "Price must be 0 or more"),
});

const editSchema = z.object({
  stockCount: z.number().int().min(0, "Stock must be 0 or more"),
  price: z.number().min(0, "Price must be 0 or more"),
});

type AddFormValues = z.infer<typeof addSchema>;
type EditFormValues = z.infer<typeof editSchema>;
type ModalMode = { type: "add" } | { type: "edit"; item: TInventoryItem };

export default function InventoryPage() {
  usePageTitle("Inventory");
  const [modal, setModal] = useState<ModalMode | null>(null);

  const { data, isLoading } = useGetInventoryQuery();
  const [addItem, { isLoading: isAdding }] = useAddInventoryItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateInventoryItemMutation();
  const [deleteItem] = useDeleteInventoryItemMutation();

  const items = data?.data?.data ?? [];

  const addForm = useForm<AddFormValues>({ resolver: zodResolver(addSchema) });
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  function openAdd() {
    addForm.reset({ name: "", stockCount: 0, price: 0 });
    setModal({ type: "add" });
  }

  function openEdit(item: TInventoryItem) {
    editForm.reset({ stockCount: item.stockCount, price: item.price });
    setModal({ type: "edit", item });
  }

  function closeModal() {
    setModal(null);
    addForm.reset();
    editForm.reset();
  }

  async function onAddSubmit(values: AddFormValues) {
    try {
      await addItem(values).unwrap();
      toast.success("Item added");
      closeModal();
    } catch {
      toast.error("Failed to add item");
    }
  }

  async function onEditSubmit(values: EditFormValues) {
    if (modal?.type !== "edit") return;
    try {
      await updateItem({ id: modal.item.id, ...values }).unwrap();
      toast.success("Item updated");
      closeModal();
    } catch {
      toast.error("Failed to update item");
    }
  }

  function handleDelete(item: TInventoryItem) {
    toast(`Delete "${item.name}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteItem(item.id).unwrap();
            toast.success("Item deleted");
          } catch {
            toast.error("Failed to delete item");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Track ingredient stock levels and prices
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Package size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            No inventory items
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Click "Add Item" to start tracking stock
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {item.stockCount === 0 ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Out of stock
                      </span>
                    ) : item.stockCount <= 5 ? (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        Low ({item.stockCount})
                      </span>
                    ) : (
                      <span className="text-gray-700">{item.stockCount}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
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

      {/* Add Modal */}
      {modal?.type === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Add Item
              </h2>
              <button
                onClick={closeModal}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={addForm.handleSubmit(onAddSubmit)}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...addForm.register("name")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="e.g. Tomatoes"
                />
                {addForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {addForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Stock Count
                  </label>
                  <input
                    {...addForm.register("stockCount", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  {addForm.formState.errors.stockCount && (
                    <p className="mt-1 text-xs text-red-500">
                      {addForm.formState.errors.stockCount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Price ($)
                  </label>
                  <input
                    {...addForm.register("price", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  {addForm.formState.errors.price && (
                    <p className="mt-1 text-xs text-red-500">
                      {addForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
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
                  disabled={isAdding}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {isAdding ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal?.type === "edit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                Edit — {modal.item.name}
              </h2>
              <button
                onClick={closeModal}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Stock Count
                  </label>
                  <input
                    {...editForm.register("stockCount", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={0}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  {editForm.formState.errors.stockCount && (
                    <p className="mt-1 text-xs text-red-500">
                      {editForm.formState.errors.stockCount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Price ($)
                  </label>
                  <input
                    {...editForm.register("price", { valueAsNumber: true })}
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  {editForm.formState.errors.price && (
                    <p className="mt-1 text-xs text-red-500">
                      {editForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
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
                  disabled={isUpdating}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {isUpdating ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
