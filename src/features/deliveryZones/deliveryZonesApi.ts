import { baseApi } from "@/app/baseApi";
import type { TDeliveryZone, TServiceability } from "@/types/deliveryZone";
import type { ApiResponse } from "@/types/api";

export interface CreateDeliveryZonePayload {
  name: string;
  description?: string;
  isActive: boolean;
  allowedCities: string[];
  allowedPostalCodes: string[];
}

export interface UpdateDeliveryZonePayload extends CreateDeliveryZonePayload {
  id: string;
}

export const deliveryZonesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryZones: build.query<ApiResponse<TDeliveryZone[]>, void>({
      query: () => "/api/deliveryzone",
      providesTags: ["DeliveryZone"],
    }),

    createDeliveryZone: build.mutation<ApiResponse<TDeliveryZone>, CreateDeliveryZonePayload>({
      query: (body) => ({ url: "/api/deliveryzone", method: "POST", body }),
      invalidatesTags: ["DeliveryZone"],
    }),

    updateDeliveryZone: build.mutation<ApiResponse<TDeliveryZone>, UpdateDeliveryZonePayload>({
      query: ({ id, ...body }) => ({ url: `/api/deliveryzone/${id}`, method: "PUT", body }),
      invalidatesTags: ["DeliveryZone"],
    }),

    deleteDeliveryZone: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/deliveryzone/${id}`, method: "DELETE" }),
      invalidatesTags: ["DeliveryZone"],
    }),

    checkServiceability: build.query<ApiResponse<TServiceability>, string>({
      query: (addressId) => ({ url: "/api/deliveryzone/check", params: { addressId } }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
  useCheckServiceabilityQuery,
} = deliveryZonesApi;
