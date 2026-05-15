import { baseApi } from "@/app/baseApi";
import type { ApiResponse } from "@/types/api";
import type { TReview, TSubmitReviewRequest, TUpdateReviewRequest, TAverageRating } from "@/types/review";

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMealReviews: build.query<ApiResponse<TReview[]>, string>({
      query: (mealId) => `/api/mealreview/meal/${mealId}`,
      providesTags: (_r, _e, mealId) => [{ type: "Review", id: mealId }],
    }),

    getMealAverageRating: build.query<ApiResponse<TAverageRating>, string>({
      query: (mealId) => `/api/mealreview/${mealId}/average-rating`,
      providesTags: (_r, _e, mealId) => [{ type: "Review", id: `avg-${mealId}` }],
    }),

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
  useGetMealReviewsQuery,
  useGetMealAverageRatingQuery,
  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
