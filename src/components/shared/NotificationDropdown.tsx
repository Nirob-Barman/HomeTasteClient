import { useState, useRef, useEffect } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} from "@/features/notifications/notificationsApi";
import { cn } from "@/utils/cn";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data, isFetching } = useGetNotificationsQuery(
    { pageNumber: 1, pageSize: 20 },
    { skip: !open }
  );
  const [markRead] = useMarkReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const unread = countData?.data?.count ?? 0;
  const notifications = data?.data?.data ?? [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleMarkRead(id: string) {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Failed to mark as read");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead().unwrap();
    } catch {
      toast.error("Failed to mark all as read");
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
    } catch {
      toast.error("Failed to delete notification");
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        title="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-800">
              Notifications
              {unread > 0 && (
                <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                  {unread} new
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 disabled:opacity-50"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {isFetching ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell size={28} className="mb-2 text-gray-300" />
                <p className="text-xs text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                    className={cn(
                      "group flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50",
                      !n.isRead && "bg-orange-50 hover:bg-orange-50/80"
                    )}
                  >
                    {/* Unread dot */}
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.isRead ? "bg-gray-200" : "bg-orange-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-800 leading-snug">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 hover:text-red-400 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
