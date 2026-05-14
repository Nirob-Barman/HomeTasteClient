import { baseApi } from "@/app/baseApi";
import type { TAdminUserResponse } from "@/types/user";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface GetUsersParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface BanUserRequest {
  reason?: string;
}

export interface AssignRoleRequest {
  userId: string;
  roleName: string;
}

export interface RemoveRoleRequest {
  userId: string;
  roleName: string;
}

type UsersResponse = ApiResponse<PaginatedResponse<TAdminUserResponse[]>>;

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UsersResponse, GetUsersParams>({
      query: ({ pageNumber = 1, pageSize = 20, search } = {}) => ({
        url: "/api/admin/users",
        params: { pageNumber, pageSize, ...(search ? { search } : {}) },
      }),
      providesTags: ["User"],
    }),

    getUserById: build.query<ApiResponse<TAdminUserResponse>, string>({
      query: (userId) => `/api/admin/users/${userId}`,
      providesTags: (_result, _err, userId) => [{ type: "User", id: userId }],
    }),

    banUser: build.mutation<ApiResponse<boolean>, { userId: string; reason?: string }>({
      query: ({ userId, reason }) => ({
        url: `/api/admin/users/${userId}/ban`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["User"],
    }),

    unbanUser: build.mutation<ApiResponse<boolean>, string>({
      query: (userId) => ({
        url: `/api/admin/users/${userId}/unban`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    assignRole: build.mutation<ApiResponse<{ userId: string; roleName: string }>, AssignRoleRequest>({
      query: (body) => ({ url: "/api/admin/users/assign-role", method: "POST", body }),
      invalidatesTags: ["User"],
    }),

    removeRole: build.mutation<ApiResponse<{ userId: string; roleName: string }>, RemoveRoleRequest>({
      query: (body) => ({ url: "/api/admin/users/remove-role", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useAssignRoleMutation,
  useRemoveRoleMutation,
} = adminApi;
