import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  TPaymentTransaction,
  TPaymentGateway,
  TPaymentStatus,
  InitiatePaymentRequest,
  RefundPaymentRequest,
  CreatePaymentGatewayRequest,
  UpdatePaymentGatewayRequest,
} from "@/types/payment";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    initiatePayment: build.mutation<ApiResponse<TPaymentTransaction>, InitiatePaymentRequest>({
      query: (body) => ({ url: "/api/payment/initiate", method: "POST", body }),
      invalidatesTags: ["Payment"],
    }),

    confirmPayment: build.mutation<ApiResponse<TPaymentTransaction>, { id: string; transactionRef?: string; notes?: string }>({
      query: ({ id, transactionRef, notes }) => ({
        url: `/api/payment/${id}/confirm`,
        method: "PATCH",
        body: { ...(transactionRef && { transactionRef }), ...(notes && { notes }) },
      }),
      invalidatesTags: ["Payment", "Order"],
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

    // Gateway management (admin)
    getPaymentGateways: build.query<ApiResponse<TPaymentGateway[]>, void>({
      query: () => "/api/paymentgateway",
      providesTags: ["PaymentGateway"],
    }),

    getActivePaymentGateways: build.query<ApiResponse<TPaymentGateway[]>, void>({
      query: () => "/api/paymentgateway/active",
      providesTags: ["PaymentGateway"],
    }),

    getPaymentGatewayById: build.query<ApiResponse<TPaymentGateway>, string>({
      query: (id) => `/api/paymentgateway/${id}`,
      providesTags: (_r, _e, id) => [{ type: "PaymentGateway", id }],
    }),

    createPaymentGateway: build.mutation<ApiResponse<TPaymentGateway>, CreatePaymentGatewayRequest>({
      query: (body) => ({ url: "/api/paymentgateway", method: "POST", body }),
      invalidatesTags: ["PaymentGateway"],
    }),

    updatePaymentGateway: build.mutation<ApiResponse<TPaymentGateway>, { id: string } & UpdatePaymentGatewayRequest>({
      query: ({ id, ...body }) => ({ url: `/api/paymentgateway/${id}`, method: "PUT", body }),
      invalidatesTags: ["PaymentGateway"],
    }),

    togglePaymentGateway: build.mutation<ApiResponse<TPaymentGateway>, string>({
      query: (id) => ({ url: `/api/paymentgateway/${id}/toggle`, method: "PATCH" }),
      invalidatesTags: ["PaymentGateway"],
    }),

    deletePaymentGateway: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/paymentgateway/${id}`, method: "DELETE" }),
      invalidatesTags: ["PaymentGateway"],
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
  useGetPaymentGatewaysQuery,
  useGetActivePaymentGatewaysQuery,
  useGetPaymentGatewayByIdQuery,
  useCreatePaymentGatewayMutation,
  useUpdatePaymentGatewayMutation,
  useTogglePaymentGatewayMutation,
  useDeletePaymentGatewayMutation,
} = paymentApi;
