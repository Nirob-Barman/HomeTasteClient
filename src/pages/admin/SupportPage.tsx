import { useState } from "react";
import { toast } from "sonner";
import { HeadphonesIcon } from "lucide-react";
import {
  useGetAllTicketsQuery,
  useUpdateTicketStatusMutation,
} from "@/features/support/supportApi";
import {
  TICKET_STATUS,
  TICKET_STATUS_LABEL,
  TICKET_PRIORITY_LABEL,
  type TTicketStatus,
  type TSupportTicket,
} from "@/types/support";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/utils/usePageTitle";

const STATUS_FILTERS: { label: string; value: TTicketStatus | 0 }[] = [
  { label: "All", value: 0 },
  { label: "Open", value: TICKET_STATUS.Open },
  { label: "In Progress", value: TICKET_STATUS.InProgress },
  { label: "Resolved", value: TICKET_STATUS.Resolved },
  { label: "Closed", value: TICKET_STATUS.Closed },
];

const STATUS_COLORS: Record<TTicketStatus, string> = {
  1: "bg-orange-100 text-orange-700",
  2: "bg-emerald-100 text-emerald-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-gray-100 text-gray-500",
};

const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-500",
  2: "bg-blue-100 text-blue-600",
  3: "bg-orange-100 text-orange-600",
  4: "bg-red-100 text-red-600",
};

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const NEXT_STATUS: Partial<Record<TTicketStatus, TTicketStatus>> = {
  [TICKET_STATUS.Open]: TICKET_STATUS.InProgress,
  [TICKET_STATUS.InProgress]: TICKET_STATUS.Resolved,
  [TICKET_STATUS.Resolved]: TICKET_STATUS.Closed,
};

export default function SupportPage() {
  usePageTitle("Support Tickets");
  const [activeFilter, setActiveFilter] = useState<TTicketStatus | 0>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const { data, isLoading } = useGetAllTicketsQuery();
  const [updateStatus, { isLoading: updating }] = useUpdateTicketStatusMutation();

  const allTickets: TSupportTicket[] = data?.data ?? [];
  const tickets =
    activeFilter === 0 ? allTickets : allTickets.filter((t) => t.status === activeFilter);

  async function handleAdvance(ticket: TSupportTicket) {
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    try {
      await updateStatus({ ticketId: ticket.id, body: { status: next } }).unwrap();
      toast.success(`Ticket moved to ${TICKET_STATUS_LABEL[next]}`);
    } catch {
      toast.error("Failed to update ticket status");
    }
  }

  async function handleClose(ticket: TSupportTicket) {
    setClosingId(null);
    try {
      await updateStatus({
        ticketId: ticket.id,
        body: { status: TICKET_STATUS.Closed },
      }).unwrap();
      toast.success("Ticket closed");
    } catch {
      toast.error("Failed to close ticket");
    }
  }

  const counts = {
    all: allTickets.length,
    open: allTickets.filter((t) => t.status === TICKET_STATUS.Open).length,
    inProgress: allTickets.filter((t) => t.status === TICKET_STATUS.InProgress).length,
    resolved: allTickets.filter((t) => t.status === TICKET_STATUS.Resolved).length,
    closed: allTickets.filter((t) => t.status === TICKET_STATUS.Closed).length,
  };

  const filterCount = [counts.all, counts.open, counts.inProgress, counts.resolved, counts.closed];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Support Tickets</h1>
        <p className="mt-0.5 text-sm text-gray-500">{allTickets.length} total tickets</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {STATUS_FILTERS.map((f, i) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeFilter === f.value
                ? "bg-orange-500 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                activeFilter === f.value ? "bg-orange-400 text-white" : "bg-gray-100 text-gray-500"
              )}
            >
              {filterCount[i]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const isExpanded = expandedId === ticket.id;
                const nextStatus = NEXT_STATUS[ticket.status];
                const isFinal =
                  ticket.status === TICKET_STATUS.Closed ||
                  ticket.status === TICKET_STATUS.Resolved;

                return (
                  <>
                    <tr
                      key={ticket.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                            <HeadphonesIcon size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1">
                              {ticket.subject ?? "(no subject)"}
                            </p>
                            <p className="text-xs text-gray-400">#{shortId(ticket.id)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            STATUS_COLORS[ticket.status]
                          )}
                        >
                          {TICKET_STATUS_LABEL[ticket.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            PRIORITY_COLORS[ticket.priority]
                          )}
                        >
                          {TICKET_PRIORITY_LABEL[ticket.priority]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(ticket.createdAt)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {!isFinal && nextStatus && (
                            <button
                              disabled={updating}
                              onClick={() => handleAdvance(ticket)}
                              className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                              → {TICKET_STATUS_LABEL[nextStatus]}
                            </button>
                          )}
                          {ticket.status !== TICKET_STATUS.Closed && (
                            <button
                              disabled={updating}
                              onClick={() => setClosingId(ticket.id)}
                              className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${ticket.id}-detail`} className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="space-y-1.5 text-sm">
                            <p className="text-gray-500">
                              <span className="font-medium text-gray-700">Description: </span>
                              {ticket.description ?? "—"}
                            </p>
                            {ticket.mobileNo && (
                              <p className="text-gray-500">
                                <span className="font-medium text-gray-700">Mobile: </span>
                                {ticket.mobileNo}
                              </p>
                            )}
                            {ticket.resolvedAt && (
                              <p className="text-gray-500">
                                <span className="font-medium text-gray-700">Resolved: </span>
                                {formatDate(ticket.resolvedAt)}
                              </p>
                            )}
                            <p className="text-gray-500">
                              <span className="font-medium text-gray-700">User ID: </span>
                              <span className="font-mono text-xs">{ticket.userId}</span>
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Close confirmation modal */}
      {closingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl">
            <div className="px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800">Close Ticket</h2>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to close this ticket? This marks it as resolved and closed.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => setClosingId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={updating}
                onClick={() => {
                  const t = tickets.find((t) => t.id === closingId);
                  if (t) handleClose(t);
                }}
                className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {updating ? "Closing…" : "Close Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
