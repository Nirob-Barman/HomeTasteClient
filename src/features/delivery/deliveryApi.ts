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

    getMyDeliveries: build.query<ApiResponse<TDeliveryAssignment[]>, void>({
      query: () => "/api/delivery/my-deliveries",
      providesTags: ["Delivery"],
    }),

    createPersonnel: build.mutation<ApiResponse<TDeliveryPersonnel>, { fullName: string; phone?: string; vehicleType?: string; vehicleNumber?: string; userId?: string }>({
      query: (body) => ({ url: "/api/delivery/personnel", method: "POST", body }),
      invalidatesTags: ["Delivery"],
    }),

    updatePersonnel: build.mutation<ApiResponse<TDeliveryPersonnel>, { id: string; fullName: string; phone?: string; vehicleType?: string; vehicleNumber?: string }>({
      query: ({ id, ...body }) => ({ url: `/api/delivery/personnel/${id}`, method: "PUT", body }),
      invalidatesTags: ["Delivery"],
    }),

    deletePersonnel: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/delivery/personnel/${id}`, method: "DELETE" }),
      invalidatesTags: ["Delivery"],
    }),

    updateLocation: build.mutation<ApiResponse<TDeliveryPersonnel>, { id: string; latitude: number; longitude: number }>({
      query: ({ id, ...body }) => ({
        url: `/api/delivery/personnel/${id}/location`,
        method: "PATCH",
        body,
      }),
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
  useGetMyDeliveriesQuery,
  useUpdateLocationMutation,
  useCreatePersonnelMutation,
  useUpdatePersonnelMutation,
  useDeletePersonnelMutation,
} = deliveryApi;
