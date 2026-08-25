export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** A work order. `ticket_number` is the integer behind the #TM-0042 stub. */
export interface Task {
  id: string;
  owner_id: string;
  ticket_number: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO 8601, or null when the ticket has no deadline. */
  due_date: string | null;
  /** Fractional rank within a column, so a drop is a single-row update. */
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  /** Free-text search across title and description. */
  q?: string;
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; emptyState: string }
> = {
  todo: {
    label: "To Do",
    emptyState: "No tickets in To Do yet — create one to get started.",
  },
  in_progress: {
    label: "In Progress",
    emptyState: "Nothing in progress. Move a ticket here when you start work.",
  },
  done: {
    label: "Done",
    emptyState: "No finished tickets yet. Completed work lands here.",
  },
};

export const PRIORITY_META: Record<TaskPriority, { label: string }> = {
  low: { label: "Low" },
  medium: { label: "Medium" },
  high: { label: "High" },
};

/** 42 -> "#TM-0042" */
export function formatTicketNumber(ticketNumber: number): string {
  return `#TM-${String(ticketNumber).padStart(4, "0")}`;
}

/** Shape every API route returns on failure. Errors say what to do next. */
export interface ApiError {
  error: string;
  /** Field-level messages, keyed by form field, for 422 responses. */
  fields?: Record<string, string[]>;
}
