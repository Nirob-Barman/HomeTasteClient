import { baseApi } from "@/app/baseApi";
import type { ApiResponse } from "@/types/api";
import type {
  TSupportTicket,
  UpdateTicketStatusRequest,
  CreateTicketRequest,
} from "@/types/support";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllTickets: build.query<ApiResponse<TSupportTicket[]>, void>({
      query: () => "/api/supportticket",
      providesTags: ["Support"],
    }),
    getMyTickets: build.query<ApiResponse<TSupportTicket[]>, string>({
      query: (userId) => `/api/supportticket/user/${userId}`,
      providesTags: ["Support"],
    }),
    createTicket: build.mutation<ApiResponse<TSupportTicket>, CreateTicketRequest>({
      query: (body) => ({ url: "/api/supportticket", method: "POST", body }),
      invalidatesTags: ["Support"],
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

export const {
  useGetAllTicketsQuery,
  useGetMyTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
} = supportApi;
