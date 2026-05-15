import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, Ticket } from "lucide-react";
import {
  useGetMyTicketsQuery,
  useCreateTicketMutation,
} from "@/features/support/supportApi";
import { useAppSelector } from "@/app/hooks";
import {
  TICKET_PRIORITY,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  type TTicketPriority,
  type TTicketStatus,
} from "@/types/support";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUS_COLOR: Record<TTicketStatus, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLOR: Record<TTicketPriority, string> = {
  1: "bg-gray-100 text-gray-600",
  2: "bg-blue-100 text-blue-700",
  3: "bg-orange-100 text-orange-700",
  4: "bg-red-100 text-red-700",
};

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.number().min(1).max(4),
  mobileNo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SupportPage() {
  usePageTitle("Support");
  const user = useAppSelector((s) => s.auth.user);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useGetMyTicketsQuery(user?.id ?? "", {
    skip: !user?.id,
  });
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();

  const tickets = data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: TICKET_PRIORITY.Medium },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createTicket({ ...values, priority: values.priority as TTicketPriority }).unwrap();
      toast.success("Ticket submitted successfully");
      reset();
      setShowForm(false);
    } catch {
      toast.error("Failed to submit ticket. Please try again.");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Support</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Submit and track your support requests
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Cancel" : "New Ticket"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            New Support Ticket
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                {...register("subject")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                placeholder="Brief description of your issue"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Priority
                </label>
                <select
                  {...register("priority", { valueAsNumber: true })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                >
                  {Object.entries(TICKET_PRIORITY).map(([label, value]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Mobile No (optional)
                </label>
                <input
                  {...register("mobileNo")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                placeholder="Please describe your issue in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {isSubmitting ? "Submitting…" : "Submit Ticket"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Ticket list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <Ticket size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No tickets yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click "New Ticket" to submit your first support request
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {ticket.subject ?? "—"}
                  </p>
                  {ticket.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {ticket.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLOR[ticket.status]}`}
                  >
                    {TICKET_STATUS_LABEL[ticket.status]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLOR[ticket.priority]}`}
                  >
                    {TICKET_PRIORITY_LABEL[ticket.priority]}
                  </span>
                </div>
              </div>
              {ticket.createdAt && (
                <p className="mt-2 text-[11px] text-gray-400">
                  {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
