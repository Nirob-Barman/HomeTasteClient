export type TTicketStatus = 1 | 2 | 3 | 4;
export type TTicketPriority = 1 | 2 | 3 | 4;

export const TICKET_STATUS = {
  Open: 1,
  Resolved: 2,
  InProgress: 3,
  Closed: 4,
} as const;

export const TICKET_PRIORITY = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
} as const;

export const TICKET_STATUS_LABEL: Record<TTicketStatus, string> = {
  1: "Open",
  2: "Resolved",
  3: "In Progress",
  4: "Closed",
};

export const TICKET_PRIORITY_LABEL: Record<TTicketPriority, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};

export interface TSupportTicket {
  id: string;
  userId: string;
  subject: string | null;
  description: string | null;
  status: TTicketStatus;
  priority: TTicketPriority;
  mobileNo: string | null;
  departmentId: string | null;
  categoryTypeId: string | null;
  createdAt: string | null;
  resolvedAt: string | null;
}

export interface UpdateTicketStatusRequest {
  status: TTicketStatus;
}
