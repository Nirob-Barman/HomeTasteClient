import { baseApi } from "@/app/baseApi";
import type { ApiResponse } from "@/types/api";
import type { TMealCustomization, TCreateMealCustomizationRequest } from "@/types/mealCustomization";

export const mealCustomizationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomizationsByMeal: build.query<ApiResponse<TMealCustomization[]>, string>({
      query: (mealId) => `/api/mealcustomization/meal/${mealId}`,
      providesTags: ["MealCustomization"],
    }),

    createCustomization: build.mutation<ApiResponse<TMealCustomization>, TCreateMealCustomizationRequest>({
      query: (body) => ({ url: "/api/mealcustomization", method: "POST", body }),
      invalidatesTags: ["MealCustomization"],
    }),

    updateCustomization: build.mutation<ApiResponse<TMealCustomization>, { id: string } & TCreateMealCustomizationRequest>({
      query: ({ id, ...body }) => ({ url: `/api/mealcustomization/${id}`, method: "PUT", body }),
      invalidatesTags: ["MealCustomization"],
    }),

    deleteCustomization: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/mealcustomization/${id}`, method: "DELETE" }),
      invalidatesTags: ["MealCustomization"],
    }),

    toggleCustomizationAvailability: build.mutation<ApiResponse<TMealCustomization>, string>({
      query: (id) => ({ url: `/api/mealcustomization/${id}/toggle-availability`, method: "PATCH" }),
      invalidatesTags: ["MealCustomization"],
    }),
  }),
});

export const {
  useGetCustomizationsByMealQuery,
  useCreateCustomizationMutation,
  useUpdateCustomizationMutation,
  useDeleteCustomizationMutation,
  useToggleCustomizationAvailabilityMutation,
} = mealCustomizationApi;
