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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const hasRefreshToken = !!(api.getState() as RootState).auth.refreshToken;
    if (hasRefreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/api/auth/refresh-token", method: "POST" },
        api,
        extraOptions
      );

      const data = refreshResult.data as ApiResponse<AuthResponse> | undefined;
      if (data?.data) {
        api.dispatch(
          updateTokens({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          })
        );
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Auth", "Meal", "MealCategory"],
  endpoints: () => ({}),
});
