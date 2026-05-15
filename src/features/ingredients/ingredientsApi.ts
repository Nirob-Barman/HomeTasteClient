import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TIngredient, TCreateIngredientRequest } from "@/types/ingredient";

export const ingredientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIngredients: build.query<
      ApiResponse<PaginatedResponse<TIngredient[]>>,
      { pageNumber?: number; pageSize?: number; searchTerm?: string }
    >({
      query: ({ pageNumber = 1, pageSize = 20, searchTerm } = {}) => ({
        url: "/api/ingredients",
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
      }),
      providesTags: ["Ingredient"],
    }),

    createIngredient: build.mutation<ApiResponse<TIngredient>, TCreateIngredientRequest>({
      query: (body) => {
        const form = new FormData();
        form.append("name", body.name);
        if (body.description) form.append("description", body.description);
        form.append("isAllergen", String(body.isAllergen));
        return { url: "/api/ingredients", method: "POST", body: form };
      },
      invalidatesTags: ["Ingredient"],
    }),

    updateIngredient: build.mutation<ApiResponse<TIngredient>, { id: string } & TCreateIngredientRequest>({
      query: ({ id, ...body }) => ({ url: `/api/ingredients/${id}`, method: "PUT", body }),
      invalidatesTags: ["Ingredient"],
    }),

    deleteIngredient: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/ingredients/${id}`, method: "DELETE" }),
      invalidatesTags: ["Ingredient"],
    }),
  }),
});

export const {
  useGetIngredientsQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
} = ingredientsApi;
