import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/features/meals/mealsApi";
import type { TMealCategory } from "@/types/meal";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/Skeleton";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type ModalMode = { type: "create" } | { type: "edit"; category: TMealCategory };

export default function CategoriesPage() {
  usePageTitle("Categories");
  const [modal, setModal] = useState<ModalMode | null>(null);

  const { data, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = data?.data?.data ?? [];
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function openCreate() {
    reset({ name: "", description: "", imageUrl: "" });
    setModal({ type: "create" });
  }

  function openEdit(category: TMealCategory) {
    reset({
      name: category.name ?? "",
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
    });
    setModal({ type: "edit", category });
  }

  function closeModal() {
    setModal(null);
    reset();
  }

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
    };
    try {
      if (modal?.type === "edit") {
        await updateCategory({ id: modal.category.id, ...payload }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created");
      }
      closeModal();
    } catch {
      toast.error("Failed to save category");
    }
  }

  function handleDelete(category: TMealCategory) {
    toast(`Delete "${category.name}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteCategory(category.id).unwrap();
            toast.success("Category deleted");
          } catch {
            toast.error("Failed to delete category");
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
          <h1 className="text-xl font-bold text-gray-800">Meal Categories</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage categories used to organise meals
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Tag size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No categories yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click "Add Category" to create the first one
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
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Image URL
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {cat.name ?? "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-500">
                    <span className="line-clamp-1">
                      {cat.description ?? "—"}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-400">
                    {cat.imageUrl ? (
                      <span className="line-clamp-1 font-mono text-xs">
                        {cat.imageUrl}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
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
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                {modal.type === "create" ? "Add Category" : "Edit Category"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="e.g. Breakfast"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="Optional short description"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Image URL
                </label>
                <input
                  {...register("imageUrl")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="https://..."
                />
                {errors.imageUrl && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.imageUrl.message}
                  </p>
                )}
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
