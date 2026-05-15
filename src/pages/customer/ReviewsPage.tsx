import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";
import {
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/features/reviews/reviewsApi";
import { useGetMealsQuery } from "@/features/meals/mealsApi";
import { useAppSelector } from "@/app/hooks";
import type { TReview } from "@/types/review";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/Skeleton";

const submitSchema = z.object({
  mealId: z.string().min(1, "Please select a meal"),
  rating: z.coerce.number().int().min(1).max(5),
  feedback: z.string().optional(),
});

const editSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  feedback: z.string().optional(),
});

type SubmitValues = z.infer<typeof submitSchema>;
type EditValues = z.infer<typeof editSchema>;

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-orange-400"
        >
          <Star
            size={22}
            fill={(hovered || value) >= n ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function StaticStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className="text-orange-400"
          fill={rating >= n ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  usePageTitle("My Reviews");
  const user = useAppSelector((s) => s.auth.user);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<TReview | null>(null);

  const { data: reviewsData, isLoading } = useGetMyReviewsQuery();
  const { data: mealsData } = useGetMealsQuery({ pageSize: 100 });
  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const reviews = reviewsData?.data ?? [];
  const meals = mealsData?.data?.data ?? [];

  const submitForm = useForm<SubmitValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: { mealId: "", rating: 5, feedback: "" },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { rating: 5, feedback: "" },
  });

  function openEdit(review: TReview) {
    editForm.reset({ rating: review.rating, feedback: review.feedback ?? "" });
    setEditTarget(review);
  }

  async function onSubmit(values: SubmitValues) {
    if (!user?.id) return;
    try {
      await submitReview({
        mealId: values.mealId,
        userId: user.id,
        rating: values.rating,
        feedback: values.feedback || undefined,
      }).unwrap();
      toast.success("Review submitted");
      submitForm.reset({ mealId: "", rating: 5, feedback: "" });
      setShowForm(false);
    } catch {
      toast.error("Failed to submit review");
    }
  }

  async function onEditSubmit(values: EditValues) {
    if (!editTarget) return;
    try {
      await updateReview({
        id: editTarget.id,
        rating: values.rating,
        feedback: values.feedback || undefined,
      }).unwrap();
      toast.success("Review updated");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update review");
    }
  }

  async function handleDelete(review: TReview) {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(review.id).unwrap();
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Reviews</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Rate and review meals you've enjoyed
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <form
          onSubmit={submitForm.handleSubmit(onSubmit)}
          className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-gray-700">New Review</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Meal <span className="text-red-500">*</span>
              </label>
              <select
                {...submitForm.register("mealId")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Select a meal…</option>
                {meals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {submitForm.formState.errors.mealId && (
                <p className="mt-1 text-xs text-red-500">
                  {submitForm.formState.errors.mealId.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Rating</label>
              <StarRating
                value={submitForm.watch("rating")}
                onChange={(v) => submitForm.setValue("rating", v)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Feedback (optional)
              </label>
              <textarea
                {...submitForm.register("feedback")}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                placeholder="Share your thoughts about this meal…"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {isSubmitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Star size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No reviews yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click "Write a Review" to share your first rating
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {review.mealName ?? "Unknown Meal"}
                  </p>
                  <StaticStars rating={review.rating} />
                  {review.feedback && (
                    <p className="mt-1.5 text-sm text-gray-500">{review.feedback}</p>
                  )}
                  {review.createdAt && (
                    <p className="mt-2 text-[11px] text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => openEdit(review)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(review)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Edit Review</h2>
              <button
                onClick={() => setEditTarget(null)}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">{editTarget.mealName}</p>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Rating</label>
                <StarRating
                  value={editForm.watch("rating")}
                  onChange={(v) => editForm.setValue("rating", v)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Feedback</label>
                <textarea
                  {...editForm.register("feedback")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
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
