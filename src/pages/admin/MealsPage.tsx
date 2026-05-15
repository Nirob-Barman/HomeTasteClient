import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Trash2, X, UtensilsCrossed } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useGetMealsQuery,
  useCreateMealMutation,
  useDeleteMealMutation,
  useGetCategoriesQuery,
} from "@/features/meals/mealsApi";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const createMealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  image: z.instanceof(FileList).optional(),
});

type CreateMealForm = z.infer<typeof createMealSchema>;

const PAGE_SIZE = 10;

export default function MealsPage() {
  usePageTitle("Meals");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetMealsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    searchTerm: search || undefined,
  });
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createMeal, { isLoading: creating }] = useCreateMealMutation();
  const [deleteMeal, { isLoading: deleting }] = useDeleteMealMutation();

  const meals = data?.data?.data ?? [];
  const meta = data?.data?.metaData;
  const categories = categoriesData?.data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMealForm>({ resolver: zodResolver(createMealSchema) });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function onCreateSubmit(values: CreateMealForm) {
    try {
      await createMeal({
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: values.categoryId,
        image: values.image?.[0],
      }).unwrap();
      toast.success("Meal created");
      setShowModal(false);
      reset();
    } catch {
      toast.error("Failed to create meal");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMeal(id).unwrap();
      toast.success("Meal deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete meal");
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Meals</h1>
          {meta && (
            <p className="mt-0.5 text-sm text-gray-500">
              {search
                ? meta.totalCount === 0
                  ? `No results for "${search}"`
                  : `${meta.totalCount} result${meta.totalCount === 1 ? "" : "s"} for "${search}"`
                : `${meta.totalCount} total meals`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search meals…"
                className="w-52 rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </form>

          <button
            onClick={() => { setShowModal(true); reset(); }}
            className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus size={15} /> Add Meal
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Meal</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : meals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  No meals found.
                </td>
              </tr>
            ) : (
              meals.map((meal) => (
                <tr
                  key={meal.id}
                  className={cn("transition-colors hover:bg-gray-50", isFetching && "opacity-60")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {meal.imageUrl ? (
                        <img
                          src={meal.imageUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-400">
                          <UtensilsCrossed size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{meal.name}</p>
                        {meal.description && (
                          <p className="text-xs text-gray-400 line-clamp-1">{meal.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
                      {meal.categoryName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    ${meal.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setDeleteId(meal.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={13} /> Delete
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
      {meta && meta.totalPages > 1 && meals.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–{(meta.pageNumber - 1) * PAGE_SIZE + meals.length} of {meta.totalCount} meals
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

      {/* Create meal modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800">Add Meal</h2>
              <button
                onClick={() => { setShowModal(false); reset(); }}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 p-5">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Chicken Biryani"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Short description…"
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              {/* Price + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Image</label>
                <input
                  {...register("image")}
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-orange-600 hover:file:bg-orange-100"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); reset(); }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create Meal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-gray-800">Delete meal?</h2>
            <p className="mt-1 text-sm text-gray-500">
              This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
