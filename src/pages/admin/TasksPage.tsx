import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus, ClipboardList } from "lucide-react";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/features/tasks/tasksApi";
import {
  TASK_PRIORITY_LABEL, TASK_PRIORITY_COLOR,
  TASK_STATUS_LABEL, TASK_STATUS_COLOR,
} from "@/types/task";
import type { TTask, TTaskPriority, TTaskStatus } from "@/types/task";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { usePageTitle } from "@/hooks/usePageTitle";

const PAGE_SIZE = 20;

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});
type FormData = z.infer<typeof schema>;

function TaskModal({ task, onClose }: { task: TTask | null; onClose: () => void }) {
  const [create, { isLoading: creating }] = useCreateTaskMutation();
  const [update, { isLoading: updating }] = useUpdateTaskMutation();
  const busy = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
      priority: task?.priority ?? 2,
      status: task?.status ?? 1,
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const payload = { ...data, dueDate: new Date(data.dueDate).toISOString() };
      if (task) {
        await update({ id: task.id, ...payload }).unwrap();
        toast.success("Task updated");
      } else {
        await create(payload).unwrap();
        toast.success("Task created");
      }
      onClose();
    } catch {
      toast.error("Failed to save task");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-gray-800">{task ? "Edit Task" : "New Task"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
            <input {...register("title")} placeholder="Task title" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
            {errors.title && <p className="mt-0.5 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <textarea {...register("description")} rows={2} placeholder="Optional description" className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Due Date</label>
            <input type="date" {...register("dueDate")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
            {errors.dueDate && <p className="mt-0.5 text-xs text-red-500">{errors.dueDate.message}</p>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Priority</label>
              <select {...register("priority", { valueAsNumber: true })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none">
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
              <select {...register("status", { valueAsNumber: true })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none">
                <option value={1}>Pending</option>
                <option value={2}>In Progress</option>
                <option value={3}>Completed</option>
                <option value={4}>Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60">
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  usePageTitle("Tasks");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<TTask | null | undefined>(undefined);
  const [deleteTask] = useDeleteTaskMutation();

  const { data, isLoading, isFetching } = useGetTasksQuery({ pageNumber: page, pageSize: PAGE_SIZE });
  const tasks = data?.data?.data ?? [];
  const meta = data?.data?.metaData;

  function handleDelete(task: TTask) {
    toast(`Delete task "${task.title}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteTask(task.id).unwrap();
            toast.success("Task deleted");
          } catch {
            toast.error("Failed to delete task");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tasks</h1>
          {meta && <p className="mt-0.5 text-sm text-gray-500">{meta.totalCount} tasks</p>}
        </div>
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus size={15} /> Add Task
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Title", "Due Date", "Priority", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><Skeleton className="h-4" /></td>
                ))}</tr>
              ))
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <ClipboardList size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">No tasks yet.</p>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{task.title ?? "—"}</p>
                    {task.description && <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{task.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TASK_PRIORITY_COLOR[task.priority as TTaskPriority])}>
                      {TASK_PRIORITY_LABEL[task.priority as TTaskPriority]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TASK_STATUS_COLOR[task.status as TTaskStatus])}>
                      {TASK_STATUS_LABEL[task.status as TTaskStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditing(task)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-orange-300 hover:text-orange-500">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(task)} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-red-300 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {(meta.pageNumber - 1) * PAGE_SIZE + 1}–{(meta.pageNumber - 1) * PAGE_SIZE + tasks.length} of {meta.totalCount}</span>
          <div className={cn("flex items-center gap-1", isFetching && "opacity-60")}>
            <button onClick={() => setPage((p) => p - 1)} disabled={meta.isFirstPage} className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - meta.pageNumber) <= 2).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn("min-w-[32px] rounded-md border px-2 py-1 text-xs", p === meta.pageNumber ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300 hover:bg-gray-50")}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => p + 1)} disabled={meta.isLastPage} className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {editing !== undefined && (
        <TaskModal task={editing} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
