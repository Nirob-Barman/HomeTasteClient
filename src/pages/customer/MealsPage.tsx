import { useState, useEffect } from "react";
import { Search, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetMealsQuery, useGetCategoriesQuery } from "@/features/meals/mealsApi";
import { addItem, updateQuantity } from "@/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 12;

export default function CustomerMealsPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useGetMealsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    searchTerm: debouncedSearch || undefined,
  });

  const { data: catData } = useGetCategoriesQuery();

  const meals = data?.data?.data ?? [];
  const meta = data?.data?.metaData;
  const categories = catData?.data?.data ?? [];

  const visibleMeals = categoryId
    ? meals.filter((m) => m.categoryId === categoryId)
    : meals;

  function cartQty(mealId: string) {
    return cartItems.find((i) => i.mealId === mealId)?.quantity ?? 0;
  }

  function handleAdd(mealId: string, mealName: string, price: number, imageUrl: string | null) {
    dispatch(addItem({ mealId, mealName, price, imageUrl }));
  }

  function handleIncrease(mealId: string, mealName: string, price: number, imageUrl: string | null) {
    const qty = cartQty(mealId);
    if (qty === 0) {
      dispatch(addItem({ mealId, mealName, price, imageUrl }));
    } else {
      dispatch(updateQuantity({ mealId, quantity: qty + 1 }));
    }
  }

  function handleDecrease(mealId: string) {
    const qty = cartQty(mealId);
    dispatch(updateQuantity({ mealId, quantity: qty - 1 }));
  }

  const totalCartItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Browse Meals</h1>
          {meta && (
            <p className="mt-0.5 text-sm text-gray-500">
              {debouncedSearch
                ? `${meta.totalCount} results for "${debouncedSearch}"`
                : `${meta.totalCount} meals available`}
            </p>
          )}
        </div>
        {totalCartItems > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600">
            <ShoppingCart size={16} />
            {totalCartItems} in cart
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meals…"
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryId(null)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              categoryId === null
                ? "bg-orange-500 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                categoryId === cat.id
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Meals grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : visibleMeals.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-base">No meals found.</p>
        </div>
      ) : (
        <div className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          isFetching && "opacity-70 pointer-events-none"
        )}>
          {visibleMeals.map((meal) => {
            const qty = cartQty(meal.id);
            return (
              <div
                key={meal.id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Meal image */}
                <div className="relative h-40 bg-orange-50">
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
                  )}
                  {meal.categoryName && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm">
                      {meal.categoryName}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-3">
                  <p className="font-semibold text-gray-800 line-clamp-1">{meal.name ?? "—"}</p>
                  {meal.description && (
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{meal.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-base font-bold text-orange-500">
                      ${meal.price.toFixed(2)}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={() => handleAdd(meal.id, meal.name ?? "", meal.price, meal.imageUrl)}
                        className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                      >
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrease(meal.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-semibold text-gray-800">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleIncrease(meal.id, meal.name ?? "", meal.price, meal.imageUrl)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination — server-side pages (category filter is client-side within a page) */}
      {meta && meta.totalPages > 1 && !categoryId && meals.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–
            {(meta.pageNumber - 1) * PAGE_SIZE + meals.length} of {meta.totalCount} meals
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
    </div>
  );
}
