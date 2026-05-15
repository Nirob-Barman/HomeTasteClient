import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Settings2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  useGetCustomizationsByMealQuery,
  useCreateCustomizationMutation,
  useUpdateCustomizationMutation,
  useDeleteCustomizationMutation,
  useToggleCustomizationAvailabilityMutation,
} from "@/features/mealCustomization/mealCustomizationApi";
import { useGetMealsQuery } from "@/features/meals/mealsApi";
import {
  CUSTOMIZATION_TYPE_LABEL,
  type TMealCustomization,
} from "@/types/mealCustomization";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const schema = z.object({
  mealId: z.string().min(1, "Meal is required"),
  name: z.string().min(1, "Name is required"),
  additionalPrice: z.number({ error: "Required" }).min(0),
  isAvailable: z.boolean(),
  optionType: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});
type FormData = z.infer<typeof schema>;

function CustomizationModal({
  option,
  defaultMealId,
  onClose,
}: {
  option: TMealCustomization | null;
  defaultMealId: string;
  onClose: () => void;
}) {
  const [create, { isLoading: creating }] = useCreateCustomizationMutation();
  const [update, { isLoading: updating }] = useUpdateCustomizationMutation();
  const busy = creating || updating;
  const { data: mealsData } = useGetMealsQuery({ pageNumber: 1, pageSize: 200 });
  const meals = mealsData?.data?.data ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mealId: option?.mealId ?? defaultMealId,
      name: option?.name ?? "",
      additionalPrice: option?.additionalPrice ?? 0,
      isAvailable: option?.isAvailable ?? true,
      optionType: option?.optionType ?? 1,
    },
  });

  async function onSubmit(data: FormData) {
    try {
      if (option) {
        await update({ id: option.id, ...data }).unwrap();
        toast.success("Option updated");
      } else {
        await create(data).unwrap();
        toast.success("Option created");
      }
      onClose();
    } catch {
      toast.error("Failed to save option");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-gray-800">{option ? "Edit Option" : "New Option"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Meal</label>
            <select {...register("mealId")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none">
              <option value="">Select meal…</option>
              {meals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {errors.mealId && <p className="mt-0.5 text-xs text-red-500">{errors.mealId.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Option Name</label>
            <input {...register("name")} placeholder="e.g. Extra Cheese" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Additional Price</label>
              <input type="number" step="0.01" {...register("additionalPrice", { valueAsNumber: true })} placeholder="0.00" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
              {errors.additionalPrice && <p className="mt-0.5 text-xs text-red-500">{errors.additionalPrice.message}</p>}
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
              <select {...register("optionType", { valueAsNumber: true })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none">
                <option value={1}>Add-On</option>
                <option value={2}>Removal</option>
                <option value={3}>Substitution</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("isAvailable")} className="h-4 w-4 rounded accent-orange-500" />
            <span className="text-sm text-gray-700">Available</span>
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

export default function MealCustomizationPage() {
  usePageTitle("Meal Customization");
  const [selectedMealId, setSelectedMealId] = useState("");
  const [editing, setEditing] = useState<TMealCustomization | null | undefined>(undefined);
  const [deleteOpt] = useDeleteCustomizationMutation();
  const [toggleAvail] = useToggleCustomizationAvailabilityMutation();

  const { data: mealsData, isLoading: loadingMeals } = useGetMealsQuery({ pageNumber: 1, pageSize: 200 });
  const meals = mealsData?.data?.data ?? [];

  const { data, isLoading } = useGetCustomizationsByMealQuery(selectedMealId, { skip: !selectedMealId });
  const options = data?.data ?? [];

  async function handleDelete(opt: TMealCustomization) {
    if (!confirm(`Delete option "${opt.name}"?`)) return;
    try {
      await deleteOpt(opt.id).unwrap();
      toast.success("Option deleted");
    } catch {
      toast.error("Failed to delete option");
    }
  }

  async function handleToggle(opt: TMealCustomization) {
    try {
      await toggleAvail(opt.id).unwrap();
      toast.success(opt.isAvailable ? "Marked unavailable" : "Marked available");
    } catch {
      toast.error("Failed to update availability");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Meal Customization</h1>
          <p className="mt-0.5 text-sm text-gray-500">Add-ons, removals, and substitutions per meal</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          disabled={!selectedMealId}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Plus size={15} /> Add Option
        </button>
      </div>

      {/* Meal selector */}
      <div className="max-w-xs">
        <label className="mb-1 block text-xs font-medium text-gray-600">Select Meal</label>
        <select
          value={selectedMealId}
          onChange={(e) => setSelectedMealId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        >
          <option value="">— choose a meal —</option>
          {loadingMeals ? <option disabled>Loading…</option> : meals.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {selectedMealId && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Option", "Type", "Price", "Available", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4" /></td>)}</tr>
                ))
              ) : options.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Settings2 size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No customization options for this meal.</p>
                  </td>
                </tr>
              ) : (
                options.map((opt) => (
                  <tr key={opt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{opt.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                        opt.optionType === 1 ? "bg-emerald-100 text-emerald-700" :
                        opt.optionType === 2 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {CUSTOMIZATION_TYPE_LABEL[opt.optionType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {opt.additionalPrice > 0 ? `+$${opt.additionalPrice.toFixed(2)}` : "Free"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(opt)} className="text-gray-400 hover:text-orange-500">
                        {opt.isAvailable
                          ? <ToggleRight size={22} className="text-emerald-500" />
                          : <ToggleLeft size={22} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditing(opt)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-orange-300 hover:text-orange-500"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(opt)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-red-300 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!selectedMealId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Settings2 size={32} className="mb-3 text-gray-300" />
          <p className="text-sm text-gray-400">Select a meal to manage its customization options.</p>
        </div>
      )}

      {editing !== undefined && (
        <CustomizationModal option={editing} defaultMealId={selectedMealId} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
