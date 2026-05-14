import { baseApi } from "@/app/baseApi";
import type { TDeliveryPersonnel, TDeliveryAssignment, TDeliveryStatus } from "@/types/delivery";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

type PersonnelResponse = ApiResponse<PaginatedResponse<TDeliveryPersonnel[]>>;

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPersonnel: build.query<PersonnelResponse, { pageNumber?: number; pageSize?: number }>({
      query: ({ pageNumber = 1, pageSize = 20 } = {}) => ({
        url: "/api/delivery/personnel",
        params: { pageNumber, pageSize },
      }),
      providesTags: ["Delivery"],
    }),

    toggleAvailability: build.mutation<ApiResponse<TDeliveryPersonnel>, string>({
      query: (id) => ({
        url: `/api/delivery/personnel/${id}/toggle-availability`,
        method: "PATCH",
      }),
      invalidatesTags: ["Delivery"],
    }),

    assignDelivery: build.mutation<ApiResponse<TDeliveryAssignment>, { orderId: string; deliveryPersonnelId: string }>({
      query: (body) => ({ url: "/api/delivery/assign", method: "POST", body }),
      invalidatesTags: ["Delivery", "Order"],
    }),

    getDeliveryByOrder: build.query<ApiResponse<TDeliveryAssignment>, string>({
      query: (orderId) => `/api/delivery/order/${orderId}`,
      providesTags: (_r, _e, orderId) => [{ type: "Delivery", id: orderId }],
    }),

    updateDeliveryStatus: build.mutation<ApiResponse<TDeliveryAssignment>, { assignmentId: string; status: TDeliveryStatus; notes?: string }>({
      query: ({ assignmentId, ...body }) => ({
        url: `/api/delivery/assignments/${assignmentId}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Delivery"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPersonnelQuery,
  useToggleAvailabilityMutation,
  useAssignDeliveryMutation,
  useGetDeliveryByOrderQuery,
  useUpdateDeliveryStatusMutation,
} = deliveryApi;
