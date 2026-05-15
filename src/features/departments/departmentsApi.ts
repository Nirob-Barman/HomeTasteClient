import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TDepartment, TCreateDepartmentRequest } from "@/types/department";

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDepartments: build.query<ApiResponse<PaginatedResponse<TDepartment[]>>, { pageNumber?: number; pageSize?: number; searchTerm?: string }>({
      query: ({ pageNumber = 1, pageSize = 20, searchTerm } = {}) => ({
        url: "/api/departments",
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
      }),
      providesTags: ["Department"],
    }),

    createDepartment: build.mutation<ApiResponse<TDepartment>, TCreateDepartmentRequest>({
      query: (body) => ({ url: "/api/departments", method: "POST", body }),
      invalidatesTags: ["Department"],
    }),

    updateDepartment: build.mutation<ApiResponse<TDepartment>, { id: string } & TCreateDepartmentRequest>({
      query: ({ id, ...body }) => ({ url: `/api/departments/${id}`, method: "PUT", body }),
      invalidatesTags: ["Department"],
    }),

    deleteDepartment: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/departments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi;
