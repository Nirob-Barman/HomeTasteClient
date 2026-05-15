import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart, Star } from "lucide-react";
import { useGetMealByIdQuery } from "@/features/meals/mealsApi";
import { useGetCustomizationsByMealQuery } from "@/features/mealCustomization/mealCustomizationApi";
import { useGetMealReviewsQuery, useGetMealAverageRatingQuery } from "@/features/reviews/reviewsApi";
import { addItem, updateQuantity } from "@/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { CUSTOMIZATION_TYPE_LABEL } from "@/types/mealCustomization";
import type { TCustomizationOptionType } from "@/types/mealCustomization";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PATHS } from "@/routes/paths";

const TYPE_STYLE: Record<TCustomizationOptionType, string> = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-red-100 text-red-600",
  3: "bg-blue-100 text-blue-600",
};

export default function MealDetailPage() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);

  const { data: mealData, isLoading: loadingMeal, isError } = useGetMealByIdQuery(mealId ?? "", { skip: !mealId });
  const { data: customData, isLoading: loadingCustom } = useGetCustomizationsByMealQuery(mealId ?? "", { skip: !mealId });
  const { data: ratingData, isLoading: loadingRating } = useGetMealAverageRatingQuery(mealId ?? "", { skip: !mealId });
  const { data: reviewsData, isLoading: loadingReviews } = useGetMealReviewsQuery(mealId ?? "", { skip: !mealId });

  const meal = mealData?.data;
  const customizations = (customData?.data ?? []).filter((c) => c.isAvailable);
  const avgRating = ratingData?.data;
  const reviews = reviewsData?.data ?? [];

  usePageTitle(meal?.name ?? "Meal Details");

  const qty = cartItems.find((i) => i.mealId === mealId)?.quantity ?? 0;

  function handleAdd() {
    if (!meal) return;
    dispatch(addItem({ mealId: meal.id, mealName: meal.name ?? "", price: meal.price, imageUrl: meal.imageUrl }));
  }

  function handleIncrease() {
    if (!meal) return;
    if (qty === 0) dispatch(addItem({ mealId: meal.id, mealName: meal.name ?? "", price: meal.price, imageUrl: meal.imageUrl }));
    else dispatch(updateQuantity({ mealId: meal.id, quantity: qty + 1 }));
  }

  function handleDecrease() {
    if (!meal) return;
    dispatch(updateQuantity({ mealId: meal.id, quantity: qty - 1 }));
  }

  const byType = customizations.reduce<Record<TCustomizationOptionType, typeof customizations>>((acc, c) => {
    const t = c.optionType as TCustomizationOptionType;
    if (!acc[t]) acc[t] = [];
    acc[t].push(c);
    return acc;
  }, {} as Record<TCustomizationOptionType, typeof customizations>);

  const totalCartItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-sm text-gray-500">Meal not found.</p>
        <button onClick={() => navigate(PATHS.CUSTOMER.MEALS)} className="mt-3 text-sm text-orange-500 hover:underline">
          Back to meals
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back + cart indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={16} /> Back
        </button>
        {totalCartItems > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600">
            <ShoppingCart size={14} />
            {totalCartItems} in cart
          </div>
        )}
      </div>

      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-orange-50 sm:h-72">
        {loadingMeal ? (
          <Skeleton className="h-full w-full" />
        ) : meal?.imageUrl ? (
          <img src={meal.imageUrl} alt={meal.name ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🍽️</div>
        )}
      </div>

      {/* Meal info */}
      {loadingMeal ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : meal ? (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{meal.name}</h1>
            <span className="shrink-0 text-2xl font-bold text-orange-500">${meal.price.toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {meal.categoryName && (
              <span className="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                {meal.categoryName}
              </span>
            )}
            {loadingRating ? (
              <Skeleton className="h-4 w-24" />
            ) : avgRating && avgRating.totalReviews > 0 ? (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-medium text-gray-800">{avgRating.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({avgRating.totalReviews})</span>
              </div>
            ) : null}
          </div>
          {meal.description && (
            <p className="text-sm leading-relaxed text-gray-600">{meal.description}</p>
          )}
        </div>
      ) : null}

      {/* Customization options */}
      {loadingCustom ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : customizations.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Customization Options</h2>
          {([1, 2, 3] as TCustomizationOptionType[]).map((type) => {
            const opts = byType[type];
            if (!opts?.length) return null;
            return (
              <div key={type}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {CUSTOMIZATION_TYPE_LABEL[type]}s
                </p>
                <div className="flex flex-wrap gap-2">
                  {opts.map((opt) => (
                    <span
                      key={opt.id}
                      className={cn("rounded-full px-3 py-1 text-xs font-medium", TYPE_STYLE[type])}
                    >
                      {opt.name}
                      {opt.additionalPrice > 0 && (
                        <span className="ml-1 opacity-75">+${opt.additionalPrice.toFixed(2)}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Reviews */}
      {loadingReviews ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5 rounded-xl border border-gray-100 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Reviews <span className="font-normal text-gray-400">({reviews.length})</span>
          </h2>
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={cn(
                        i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </div>
                {review.createdAt && (
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
              {review.feedback && (
                <p className="text-sm text-gray-600">{review.feedback}</p>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Add to cart */}
      {meal && (
        <div className="sticky bottom-0 -mx-6 border-t border-gray-100 bg-white px-6 py-4">
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <Plus size={16} /> Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                ${(meal.price * qty).toFixed(2)} total
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrease}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[1.5rem] text-center text-base font-bold text-gray-800">{qty}</span>
                <button
                  onClick={handleIncrease}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
