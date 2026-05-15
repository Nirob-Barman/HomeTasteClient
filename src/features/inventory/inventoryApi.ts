import { baseApi } from "@/app/baseApi";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  TInventoryItem,
  TAddInventoryItemRequest,
  TUpdateInventoryItemRequest,
} from "@/types/inventory";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInventory: build.query<ApiResponse<PaginatedResponse<TInventoryItem[]>>, void>({
      query: () => ({ url: "/api/inventory", params: { pageNumber: 1, pageSize: 100 } }),
      providesTags: ["Inventory"],
    }),

    addInventoryItem: build.mutation<ApiResponse<TInventoryItem>, TAddInventoryItemRequest>({
      query: (body) => ({ url: "/api/inventory", method: "POST", body }),
      invalidatesTags: ["Inventory"],
    }),

    updateInventoryItem: build.mutation<
      ApiResponse<TInventoryItem>,
      { id: string } & TUpdateInventoryItemRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/api/inventory/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Inventory"],
    }),

    deleteInventoryItem: build.mutation<ApiResponse<boolean>, string>({
      query: (id) => ({ url: `/api/inventory/${id}`, method: "DELETE" }),
      invalidatesTags: ["Inventory"],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useAddInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi;
