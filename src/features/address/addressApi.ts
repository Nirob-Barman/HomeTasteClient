import { baseApi } from "@/app/baseApi";
import type { ApiResponse } from "@/types/api";
import type { TAddress, CreateAddressRequest } from "@/types/address";

export const addressApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAddresses: build.query<ApiResponse<TAddress[]>, void>({
      query: () => "/api/address",
      providesTags: ["Address"],
    }),
    createAddress: build.mutation<ApiResponse<TAddress>, CreateAddressRequest>({
      query: (body) => ({ url: "/api/address", method: "POST", body }),
      invalidatesTags: ["Address"],
    }),
    updateAddress: build.mutation<ApiResponse<TAddress>, { id: string } & CreateAddressRequest>({
      query: ({ id, ...body }) => ({ url: `/api/address/${id}`, method: "PUT", body }),
      invalidatesTags: ["Address"],
    }),
    deleteAddress: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/address/${id}`, method: "DELETE" }),
      invalidatesTags: ["Address"],
    }),
    setDefaultAddress: build.mutation<ApiResponse<TAddress>, string>({
      query: (id) => ({ url: `/api/address/${id}/set-default`, method: "PATCH" }),
      invalidatesTags: ["Address"],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;
