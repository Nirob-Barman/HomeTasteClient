import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TCoupon, TCouponValidationResponse } from "@/types/coupon";

interface ValidateCouponRequest {
  code: string;
  orderAmount: number;
}

interface CreateCouponRequest {
  code: string;
  description?: string;
  discountType: number;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive: boolean;
  isFirstOrderOnly: boolean;
}

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    validateCoupon: build.mutation<ApiResponse<TCouponValidationResponse>, ValidateCouponRequest>({
      query: (body) => ({ url: "/api/coupon/validate", method: "POST", body }),
    }),

    getCoupons: build.query<ApiResponse<PaginatedResponse<TCoupon[]>>, void>({
      query: () => ({ url: "/api/coupon", params: { pageNumber: 1, pageSize: 100 } }),
      providesTags: ["Coupon"],
    }),

    createCoupon: build.mutation<ApiResponse<TCoupon>, CreateCouponRequest>({
      query: (body) => ({ url: "/api/coupon", method: "POST", body }),
      invalidatesTags: ["Coupon"],
    }),

    updateCoupon: build.mutation<ApiResponse<TCoupon>, { id: string } & Partial<CreateCouponRequest>>({
      query: ({ id, ...body }) => ({ url: `/api/coupon/${id}`, method: "PUT", body }),
      invalidatesTags: ["Coupon"],
    }),

    deleteCoupon: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/coupon/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupon"],
    }),

    toggleCouponActive: build.mutation<ApiResponse<TCoupon>, string>({
      query: (id) => ({ url: `/api/coupon/${id}/toggle`, method: "PATCH" }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponActiveMutation,
} = couponsApi;
