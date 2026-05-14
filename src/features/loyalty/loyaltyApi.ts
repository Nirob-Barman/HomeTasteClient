import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TLoyaltyAccount, TLoyaltyTransaction, TPointsPreview } from "@/types/loyalty";

export const loyaltyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyAccount: build.query<ApiResponse<TLoyaltyAccount>, void>({
      query: () => "/api/loyalty/my-account",
      providesTags: ["Loyalty"],
    }),
    getMyTransactions: build.query<
      ApiResponse<PaginatedResponse<TLoyaltyTransaction[]>>,
      { pageNumber?: number; pageSize?: number }
    >({
      query: ({ pageNumber = 1, pageSize = 20 } = {}) => ({
        url: "/api/loyalty/my-transactions",
        params: { pageNumber, pageSize },
      }),
      providesTags: ["Loyalty"],
    }),
    previewRedemption: build.query<ApiResponse<TPointsPreview>, number>({
      query: (points) => ({
        url: "/api/loyalty/preview-redemption",
        params: { points },
      }),
    }),
  }),
});

export const {
  useGetMyAccountQuery,
  useGetMyTransactionsQuery,
  usePreviewRedemptionQuery,
} = loyaltyApi;
