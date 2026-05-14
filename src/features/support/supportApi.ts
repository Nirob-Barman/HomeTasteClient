import { baseApi } from "@/app/baseApi";
import type { ApiResponse } from "@/types/api";
import type { TSupportTicket, UpdateTicketStatusRequest } from "@/types/support";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllTickets: build.query<ApiResponse<TSupportTicket[]>, void>({
      query: () => "/api/supportticket",
      providesTags: ["Support"],
    }),
    updateTicketStatus: build.mutation<
      ApiResponse<TSupportTicket>,
      { ticketId: string; body: UpdateTicketStatusRequest }
    >({
      query: ({ ticketId, body }) => ({
        url: `/api/supportticket/${ticketId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Support"],
    }),
  }),
});

export const { useGetAllTicketsQuery, useUpdateTicketStatusMutation } = supportApi;
