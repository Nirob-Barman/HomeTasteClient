import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  TPaymentTransaction,
  TPaymentStatus,
  InitiatePaymentRequest,
  ConfirmPaymentRequest,
  RefundPaymentRequest,
} from "@/types/payment";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    initiatePayment: build.mutation<ApiResponse<TPaymentTransaction>, InitiatePaymentRequest>({
      query: (body) => ({ url: "/api/payment/initiate", method: "POST", body }),
      invalidatesTags: ["Payment"],
    }),

    confirmPayment: build.mutation<
      ApiResponse<TPaymentTransaction>,
      { id: string } & ConfirmPaymentRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/api/payment/${id}/confirm`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    refundPayment: build.mutation<
      ApiResponse<TPaymentTransaction>,
      { id: string } & RefundPaymentRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/api/payment/${id}/refund`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    getPaymentByOrder: build.query<ApiResponse<TPaymentTransaction>, string>({
      query: (orderId) => `/api/payment/order/${orderId}`,
      providesTags: ["Payment"],
    }),

    getPaymentById: build.query<ApiResponse<TPaymentTransaction>, string>({
      query: (id) => `/api/payment/${id}`,
      providesTags: ["Payment"],
    }),

    getAllPayments: build.query<
      ApiResponse<PaginatedResponse<TPaymentTransaction[]>>,
      { pageNumber?: number; pageSize?: number; status?: TPaymentStatus }
    >({
      query: ({ pageNumber = 1, pageSize = 15, status } = {}) => ({
        url: "/api/payment",
        params: { pageNumber, pageSize, ...(status ? { status } : {}) },
      }),
      providesTags: ["Payment"],
    }),
  }),
});

export const {
  useInitiatePaymentMutation,
  useConfirmPaymentMutation,
  useRefundPaymentMutation,
  useGetPaymentByOrderQuery,
  useGetPaymentByIdQuery,
  useGetAllPaymentsQuery,
} = paymentApi;
