import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { updateTokens, clearCredentials } from "@/features/auth/authSlice";
import type { AuthResponse } from "@/features/auth/types";
import type { ApiResponse } from "@/types/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7082",
  credentials: "include",
  prepareHeaders(headers, { getState }) {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Shared promise so concurrent 401s share one refresh call instead of each
// racing to revoke the single-use refresh token.
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const { refreshToken } = (api.getState() as RootState).auth;
    if (!refreshToken) {
      api.dispatch(clearCredentials());
      return result;
    }

    if (!refreshPromise) {
      // Send the refresh token in the body — cookie alone is unreliable
      // across different schemes (http frontend → https API) in development.
      refreshPromise = Promise.resolve(
        rawBaseQuery(
          { url: "/api/auth/refresh-token", method: "POST", body: { refreshToken } },
          api,
          extraOptions,
        ),
      ).then((r) => {
        const data = (r.data as ApiResponse<AuthResponse> | undefined)?.data;
        return data ? { accessToken: data.accessToken, refreshToken: data.refreshToken } : null;
      }).finally(() => {
        refreshPromise = null;
      });
    }

    const tokens = await refreshPromise;
    if (tokens) {
      api.dispatch(updateTokens(tokens));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Auth", "Meal", "MealCategory", "Order", "Delivery", "Analytics", "Support", "Address", "Loyalty", "Notification", "Inventory", "Coupon", "Review", "Payment", "PaymentGateway", "Unit", "Ingredient", "MealIngredient", "MealCustomization", "Department", "CategoryType", "Task", "DeliveryZone"],
  endpoints: () => ({}),
});
