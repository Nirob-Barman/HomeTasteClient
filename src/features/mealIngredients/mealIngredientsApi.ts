import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TMealIngredient, TCreateMealIngredientRequest } from "@/types/mealIngredient";

export const mealIngredientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMealIngredients: build.query<
      ApiResponse<PaginatedResponse<TMealIngredient[]>>,
      { pageNumber?: number; pageSize?: number; searchTerm?: string }
    >({
      query: ({ pageNumber = 1, pageSize = 20, searchTerm } = {}) => ({
        url: "/api/mealingredients",
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
      }),
      providesTags: ["MealIngredient"],
    }),

    createMealIngredient: build.mutation<ApiResponse<TMealIngredient>, TCreateMealIngredientRequest>({
      query: (body) => ({ url: "/api/mealingredients", method: "POST", body }),
      invalidatesTags: ["MealIngredient"],
    }),

    updateMealIngredient: build.mutation<ApiResponse<TMealIngredient>, { id: string } & TCreateMealIngredientRequest>({
      query: ({ id, ...body }) => ({ url: `/api/mealingredients/${id}`, method: "PUT", body }),
      invalidatesTags: ["MealIngredient"],
    }),

    deleteMealIngredient: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/mealingredients/${id}`, method: "DELETE" }),
      invalidatesTags: ["MealIngredient"],
    }),
  }),
});

export const {
  useGetMealIngredientsQuery,
  useCreateMealIngredientMutation,
  useUpdateMealIngredientMutation,
  useDeleteMealIngredientMutation,
} = mealIngredientsApi;
