import { baseApi } from "@/app/baseApi";
import type { TOrder, TOrderStatus } from "@/types/order";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface GetOrdersParams {
  pageNumber?: number;
  pageSize?: number;
  status?: TOrderStatus;
}

type OrdersResponse = ApiResponse<PaginatedResponse<TOrder[]>>;

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrdersResponse, GetOrdersParams>({
      query: ({ pageNumber = 1, pageSize = 15, status } = {}) => ({
        url: "/api/order",
        params: { pageNumber, pageSize, ...(status !== undefined ? { status } : {}) },
      }),
      providesTags: ["Order"],
    }),

    updateOrderStatus: build.mutation<ApiResponse<TOrder>, { id: string; status: TOrderStatus; cancellationReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/api/order/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    cancelOrder: build.mutation<ApiResponse<TOrder>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/api/order/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = ordersApi;
