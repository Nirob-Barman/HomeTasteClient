import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TCategoryType, TCreateCategoryTypeRequest } from "@/types/categoryType";

export const categoryTypesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategoryTypes: build.query<ApiResponse<PaginatedResponse<TCategoryType[]>>, { pageNumber?: number; pageSize?: number; searchTerm?: string }>({
      query: ({ pageNumber = 1, pageSize = 20, searchTerm } = {}) => ({
        url: "/api/categorytypes",
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
      }),
      providesTags: ["CategoryType"],
    }),

    createCategoryType: build.mutation<ApiResponse<TCategoryType>, TCreateCategoryTypeRequest>({
      query: (body) => ({ url: "/api/categorytypes", method: "POST", body }),
      invalidatesTags: ["CategoryType"],
    }),

    updateCategoryType: build.mutation<ApiResponse<TCategoryType>, { id: string } & TCreateCategoryTypeRequest>({
      query: ({ id, ...body }) => ({ url: `/api/categorytypes/${id}`, method: "PUT", body }),
      invalidatesTags: ["CategoryType"],
    }),

    deleteCategoryType: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/categorytypes/${id}`, method: "DELETE" }),
      invalidatesTags: ["CategoryType"],
    }),
  }),
});

export const {
  useGetCategoryTypesQuery,
  useCreateCategoryTypeMutation,
  useUpdateCategoryTypeMutation,
  useDeleteCategoryTypeMutation,
} = categoryTypesApi;
