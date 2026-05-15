import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TNotification, TUnreadCount } from "@/types/notification";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<ApiResponse<PaginatedResponse<TNotification[]>>, { pageNumber?: number; pageSize?: number }>({
      query: ({ pageNumber = 1, pageSize = 20 } = {}) => ({
        url: "/api/notification",
        params: { pageNumber, pageSize },
      }),
      providesTags: ["Notification"],
    }),

    getUnreadCount: build.query<ApiResponse<TUnreadCount>, void>({
      query: () => "/api/notification/unread-count",
      providesTags: ["Notification"],
    }),

    markRead: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/notification/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),

    markAllRead: build.mutation<ApiResponse<boolean>, void>({
      query: () => ({ url: "/api/notification/read-all", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/notification/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
