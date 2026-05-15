export type TTaskPriority = 1 | 2 | 3;
export type TTaskStatus = 1 | 2 | 3 | 4;

export const TASK_PRIORITY_LABEL: Record<TTaskPriority, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

export const TASK_PRIORITY_COLOR: Record<TTaskPriority, string> = {
  1: "bg-gray-100 text-gray-600",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-red-100 text-red-600",
};

export const TASK_STATUS_LABEL: Record<TTaskStatus, string> = {
  1: "Pending",
  2: "In Progress",
  3: "Completed",
  4: "Cancelled",
};

export const TASK_STATUS_COLOR: Record<TTaskStatus, string> = {
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-emerald-100 text-emerald-700",
  4: "bg-gray-100 text-gray-500",
};

export interface TTask {
  id: string;
  title: string | null;
  description: string | null;
  dueDate: string;
  priority: TTaskPriority;
  status: TTaskStatus;
}

export interface TCreateTaskRequest {
  title: string;
  description?: string;
  dueDate: string;
  priority: TTaskPriority;
  status: TTaskStatus;
}
