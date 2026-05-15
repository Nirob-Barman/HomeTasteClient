import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TTask, TCreateTaskRequest } from "@/types/task";

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<ApiResponse<PaginatedResponse<TTask[]>>, { pageNumber?: number; pageSize?: number; searchTerm?: string }>({
      query: ({ pageNumber = 1, pageSize = 20, searchTerm } = {}) => ({
        url: "/api/tasks",
        params: { pageNumber, pageSize, ...(searchTerm ? { searchTerm } : {}) },
      }),
      providesTags: ["Task"],
    }),

    createTask: build.mutation<ApiResponse<TTask>, TCreateTaskRequest>({
      query: (body) => ({ url: "/api/tasks", method: "POST", body }),
      invalidatesTags: ["Task"],
    }),

    updateTask: build.mutation<ApiResponse<TTask>, { id: string } & TCreateTaskRequest>({
      query: ({ id, ...body }) => ({ url: `/api/tasks/${id}`, method: "PUT", body }),
      invalidatesTags: ["Task"],
    }),

    deleteTask: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
