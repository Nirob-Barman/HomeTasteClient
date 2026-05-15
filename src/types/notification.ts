export interface TNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: number;
  typeLabel: string;
  isRead: boolean;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string | null;
}

export interface TUnreadCount {
  count: number;
}
