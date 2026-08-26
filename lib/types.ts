/**
 * Mirrors db/schema.sql. The two enums below are the same values, in the
 * same order, as the task_status and task_priority Postgres types -- change one
 * and you must change the other.
 */

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** A row of public.tasks. `ticket_no` is the integer behind the #TM-0042 stub. */
export interface Task {
  id: string;
  user_id: string;
  ticket_no: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO 8601 timestamptz, or null when the ticket has no deadline. */
  due_date: string | null;
  /** Sort order within a status column. Lower sorts first. */
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * What an insert may send. Everything omitted here has a database default:
 * `id` and `created_at`/`updated_at` generate themselves, `user_id` defaults to
 * auth.uid(), and `ticket_no` is assigned by the assign_ticket_no() trigger.
 */
export type TaskInsert = Pick<Task, "title"> &
  Partial<
    Pick<Task, "description" | "status" | "priority" | "due_date" | "position">
  > & { user_id?: string };

/** What an update may change. `updated_at` is maintained by a trigger. */
export type TaskUpdate = Partial<
  Pick<
    Task,
    "title" | "description" | "status" | "priority" | "due_date" | "position"
  >
>;

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  /** Free-text search across titles, backed by the pg_trgm index. */
  search?: string;
  q?: string;
  sort?: "due_date" | "created_at" | "priority";
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; emptyState: string }
> = {
  todo: {
    label: "To Do",
    emptyState: "No tasks in To Do yet. Add the first one.",
  },
  in_progress: {
    label: "In Progress",
    emptyState: "Nothing is in progress. Move a task here when work starts.",
  },
  done: {
    label: "Done",
    emptyState: "No finished tasks yet. Completed work lands here.",
  },
};

export const PRIORITY_META: Record<TaskPriority, { label: string }> = {
  low: { label: "Low" },
  medium: { label: "Medium" },
  high: { label: "High" },
};

/** 42 -> "#TM-0042" */
export function formatTicketNumber(ticketNo: number): string {
  return `#TM-${String(ticketNo).padStart(4, "0")}`;
}

/** Shape every API route returns on failure. Errors say what to do next. */
export interface ApiError {
  error: {
    message: string;
    field?: string;
  };
}
