import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TUnit, TCreateUnitRequest } from "@/types/unit";

export const unitsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUnits: build.query<
      ApiResponse<PaginatedResponse<TUnit[]>>,
      { pageNumber?: number; pageSize?: number; searchTerm?: string }
    >({
      query: ({ pageNumber = 1, pageSize = 20, searchTerm } = {}) => ({
        url: "/api/units",
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
      }),
      providesTags: ["Unit"],
    }),

    createUnit: build.mutation<ApiResponse<TUnit>, TCreateUnitRequest>({
      query: (body) => ({ url: "/api/units", method: "POST", body }),
      invalidatesTags: ["Unit"],
    }),

    updateUnit: build.mutation<ApiResponse<TUnit>, { id: string } & TCreateUnitRequest>({
      query: ({ id, ...body }) => ({ url: `/api/units/${id}`, method: "PUT", body }),
      invalidatesTags: ["Unit"],
    }),

    softDeleteUnit: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/units/soft/${id}`, method: "DELETE" }),
      invalidatesTags: ["Unit"],
    }),
  }),
});

export const {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useSoftDeleteUnitMutation,
} = unitsApi;
