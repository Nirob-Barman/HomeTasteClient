import { baseApi } from "@/app/baseApi";
import type { TOrder, TOrderStatus, TDeliveryFee, CreateOrderRequest } from "@/types/order";
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

    placeOrder: build.mutation<ApiResponse<TOrder>, CreateOrderRequest>({
      query: (body) => ({ url: "/api/order", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),

    getMyOrders: build.query<ApiResponse<PaginatedResponse<TOrder[]>>, { pageNumber?: number; pageSize?: number }>({
      query: ({ pageNumber = 1, pageSize = 15 } = {}) => ({
        url: "/api/order/my",
        params: { pageNumber, pageSize },
      }),
      providesTags: ["Order"],
    }),

    getMyOrderById: build.query<ApiResponse<TOrder>, string>({
      query: (id) => `/api/order/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    getDeliveryFee: build.query<ApiResponse<TDeliveryFee>, number>({
      query: (subTotal) => ({ url: "/api/order/delivery-fee", params: { subTotal } }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderByIdQuery,
  useGetDeliveryFeeQuery,
} = ordersApi;
