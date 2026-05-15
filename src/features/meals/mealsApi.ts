import { baseApi } from "@/app/baseApi";
import type { TMeal, TMealCategory } from "@/types/meal";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface GetMealsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface CreateMealPayload {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: File;
}

export interface UpdateMealPayload {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
}

type MealsResponse = ApiResponse<PaginatedResponse<TMeal[]>>;
type CategoriesResponse = ApiResponse<PaginatedResponse<TMealCategory[]>>;

export const mealsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMeals: build.query<MealsResponse, GetMealsParams>({
      query: ({ pageNumber = 1, pageSize = 10, searchTerm } = {}) => ({
        url: "/api/meals",
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
      }),
      providesTags: ["Meal"],
    }),

    getMealById: build.query<ApiResponse<TMeal>, string>({
      query: (id) => `/api/meals/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Meal", id }],
    }),

    createMeal: build.mutation<ApiResponse<TMeal>, CreateMealPayload>({
      query: ({ image, ...fields }) => {
        const body = new FormData();
        body.append("name", fields.name);
        body.append("price", String(fields.price));
        body.append("categoryId", fields.categoryId);
        if (fields.description) body.append("description", fields.description);
        if (image) body.append("image", image);
        return { url: "/api/meals", method: "POST", body };
      },
      invalidatesTags: ["Meal"],
    }),

    updateMeal: build.mutation<ApiResponse<TMeal>, UpdateMealPayload>({
      query: ({ id, ...body }) => ({
        url: `/api/meals/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Meal"],
    }),

    deleteMeal: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/meals/${id}`, method: "DELETE" }),
      invalidatesTags: ["Meal"],
    }),

    getCategories: build.query<CategoriesResponse, void>({
      query: () => ({ url: "/api/mealcategories", params: { pageNumber: 1, pageSize: 100 } }),
      providesTags: ["MealCategory"],
    }),

    createCategory: build.mutation<
      ApiResponse<TMealCategory>,
      { name: string; description?: string; imageUrl?: string }
    >({
      query: (body) => ({ url: "/api/mealcategories", method: "POST", body }),
      invalidatesTags: ["MealCategory"],
    }),

    updateCategory: build.mutation<
      ApiResponse<TMealCategory>,
      { id: string; name: string; description?: string; imageUrl?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/mealcategories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["MealCategory"],
    }),

    deleteCategory: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/mealcategories/${id}`, method: "DELETE" }),
      invalidatesTags: ["MealCategory"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMealsQuery,
  useGetMealByIdQuery,
  useCreateMealMutation,
  useUpdateMealMutation,
  useDeleteMealMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = mealsApi;
