import { baseApi } from "@/app/baseApi";
import type { ApiResponse } from "@/types/api";
import type { TReview, TSubmitReviewRequest, TUpdateReviewRequest } from "@/types/review";

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyReviews: build.query<ApiResponse<TReview[]>, void>({
      query: () => "/api/mealreview/my-reviews",
      providesTags: ["Review"],
    }),

    submitReview: build.mutation<ApiResponse<TReview>, TSubmitReviewRequest>({
      query: (body) => ({ url: "/api/mealreview", method: "POST", body }),
      invalidatesTags: ["Review"],
    }),

    updateReview: build.mutation<ApiResponse<TReview>, { id: string } & TUpdateReviewRequest>({
      query: ({ id, ...body }) => ({ url: `/api/mealreview/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Review"],
    }),

    deleteReview: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/mealreview/${id}`, method: "DELETE" }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
