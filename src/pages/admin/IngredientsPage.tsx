import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus, Leaf } from "lucide-react";
import {
  useGetIngredientsQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
} from "@/features/ingredients/ingredientsApi";
import type { TIngredient } from "@/types/ingredient";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const PAGE_SIZE = 20;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isAllergen: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function IngredientModal({ ingredient, onClose }: { ingredient: TIngredient | null; onClose: () => void }) {
  const [create, { isLoading: creating }] = useCreateIngredientMutation();
  const [update, { isLoading: updating }] = useUpdateIngredientMutation();
  const busy = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: ingredient?.name ?? "",
      description: ingredient?.description ?? "",
      isAllergen: ingredient?.isAllergen ?? false,
    },
  });

  async function onSubmit(data: FormData) {
    try {
      if (ingredient) {
        await update({ id: ingredient.id, ...data }).unwrap();
        toast.success("Ingredient updated");
      } else {
        await create(data).unwrap();
        toast.success("Ingredient created");
      }
      onClose();
    } catch {
      toast.error("Failed to save ingredient");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-gray-800">{ingredient ? "Edit Ingredient" : "New Ingredient"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
            <input {...register("name")} placeholder="e.g. Tomato" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <textarea {...register("description")} rows={2} placeholder="Optional description" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("isAllergen")} className="h-4 w-4 rounded accent-orange-500" />
            <span className="text-sm text-gray-700">Allergen</span>
          </label>
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

export default function IngredientsPage() {
  usePageTitle("Ingredients");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<TIngredient | null | undefined>(undefined);
  const [deleteIngredient] = useDeleteIngredientMutation();

  const { data, isLoading, isFetching } = useGetIngredientsQuery({ pageNumber: page, pageSize: PAGE_SIZE });
  const ingredients = data?.data?.data ?? [];
  const meta = data?.data?.metaData;

  async function handleDelete(ing: TIngredient) {
    if (!confirm(`Delete ingredient "${ing.name}"?`)) return;
    try {
      await deleteIngredient(ing.id).unwrap();
      toast.success("Ingredient deleted");
    } catch {
      toast.error("Failed to delete ingredient");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Ingredients</h1>
          {meta && <p className="mt-0.5 text-sm text-gray-500">{meta.totalCount} ingredients</p>}
        </div>
        <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600">
          <Plus size={15} /> Add Ingredient
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Description", "Allergen", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4" /></td>)}</tr>
              ))
            ) : ingredients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  <Leaf size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">No ingredients yet.</p>
                </td>
              </tr>
            ) : (
              ingredients.map((ing) => (
                <tr key={ing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{ing.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{ing.description ?? "—"}</td>
                  <td className="px-4 py-3">
                    {ing.isAllergen ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Allergen</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing(ing)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-orange-300 hover:text-orange-500"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(ing)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-red-300 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–{(meta.pageNumber - 1) * PAGE_SIZE + ingredients.length} of {meta.totalCount}</span>
          <div className={cn("flex items-center gap-1", isFetching && "opacity-60")}>
            <button onClick={() => setPage((p) => p - 1)} disabled={meta.isFirstPage} className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - meta.pageNumber) <= 2).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn("min-w-[32px] rounded-md border px-2 py-1 text-xs", p === meta.pageNumber ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300 hover:bg-gray-50")}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => p + 1)} disabled={meta.isLastPage} className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {editing !== undefined && <IngredientModal ingredient={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}
