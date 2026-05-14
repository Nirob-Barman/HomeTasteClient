import { baseApi } from "@/app/baseApi";
import type { ApiResponse } from "@/types/api";
import type { TDashboardStats } from "@/types/analytics";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<ApiResponse<TDashboardStats>, void>({
      query: () => "/api/analytics/dashboard",
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = analyticsApi;
