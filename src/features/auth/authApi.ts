import { baseApi } from "@/app/baseApi";
import { setCredentials, setTokensOnly, clearCredentials } from "./authSlice";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from "./types";
import type { TUserProfile } from "@/types/user";
import type { ApiResponse } from "@/types/api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const tokens = data.data;
          // Store tokens first so prepareHeaders can inject the Bearer token
          dispatch(setTokensOnly({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }));
          const meResult = await dispatch(
            authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })
          );
          if (meResult.data) {
            dispatch(
              setCredentials({
                user: meResult.data.data,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
              })
            );
          }
        } catch {
          // login failed — no credentials set
        }
      },
    }),

    register: build.mutation<ApiResponse<RegisterResponse>, RegisterRequest>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
    }),

    getMe: build.query<ApiResponse<TUserProfile>, undefined>({
      query: () => "/api/auth/me",
      providesTags: ["Auth"],
    }),

    refreshToken: build.mutation<ApiResponse<AuthResponse>, void>({
      query: () => ({ url: "/api/auth/refresh-token", method: "POST" }),
    }),

    logout: build.mutation<ApiResponse<null>, void>({
      query: () => ({ url: "/api/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
