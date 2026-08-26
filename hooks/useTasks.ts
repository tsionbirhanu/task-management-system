"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { summarizeReminders } from "@/lib/reminders";
import type { ApiError, Task, TaskFilters, TaskPriority } from "@/lib/types";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from "@/lib/validation/task";

/**
 * Query keys, in one place, so mutations can invalidate precisely instead of
 * blowing away the whole cache on every drag.
 */
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * The filter shape the reminder query runs under.
 *
 * Deliberately identical to the board's filters when nothing is filtered --
 * same empty fields, same default sort -- so React Query hashes both to one key
 * and an unfiltered board shares this cache entry instead of fetching the same
 * rows twice. It also sits under taskKeys.lists(), which is what every mutation
 * already invalidates and what updateTaskInLists already patches, so reminders
 * stay in step with drags and edits for free.
 */
const REMINDER_FILTERS: TaskFilters = { sort: "created_at" };

function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.sort) params.set("sort", filters.sort);

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(
      body?.error?.message ??
        "The server could not finish that request. Try again.",
    );
  }

  return (await response.json()) as T;
}

async function fetchTasks(filters: TaskFilters): Promise<Task[]> {
  const response = await fetch(`/api/tasks${buildQueryString(filters)}`);
  const body = await readJson<{ tasks: Task[] }>(response);
  return body.tasks;
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchTasks(filters),
  });
}

/**
 * Overdue and due-soon counts across *every* open ticket.
 *
 * Reminders are a global concern: a ticket does not stop being overdue because
 * the board is currently filtered to another status. This is why the bell reads
 * from here rather than from whatever useTasks(filters) happens to hold.
 */
export function useReminders() {
  return useQuery({
    queryKey: taskKeys.list(REMINDER_FILTERS),
    queryFn: () => fetchTasks(REMINDER_FILTERS),
    // Narrows the cached Task[] to counts for this observer only -- the cache
    // still stores full rows, so list invalidation and patching keep working.
    select: summarizeReminders,
  });
}

function matchesFilters(task: Task, filters: TaskFilters): boolean {
  const search = (filters.search ?? "").toLowerCase();

  return (
    (!filters.status || task.status === filters.status) &&
    (!filters.priority || task.priority === filters.priority) &&
    (!search || task.title.toLowerCase().includes(search))
  );
}

function sortTasks(tasks: Task[], sort: TaskFilters["sort"] = "created_at") {
  return [...tasks].sort((a, b) => {
    if (sort === "due_date") {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }

    if (sort === "priority") {
      const rank: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
      return rank[a.priority] - rank[b.priority];
    }

    return b.created_at.localeCompare(a.created_at);
  });
}

/**
 * Apply an edit to every cached list.
 *
 * Each cached list was fetched under its own filters, so after the edit a task
 * may no longer belong in it -- dragging to Done removes it from a `?status=todo`
 * list. Re-filtering and re-sorting per entry keeps every cached view honest
 * without refetching any of them.
 */
function updateTaskInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (task: Task) => Task | null,
) {
  queryClient
    .getQueryCache()
    .findAll({ queryKey: taskKeys.lists() })
    .forEach((query) => {
      const filters = (query.queryKey[2] ?? {}) as TaskFilters;

      queryClient.setQueryData<Task[]>(query.queryKey, (current) => {
        if (!current) return current;

        const next = current
          .map(updater)
          .filter((task): task is Task => task !== null)
          .filter((task) => matchesFilters(task, filters));

        return sortTasks(next, filters.sort);
      });
    });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await readJson<{ task: Task }>(response);
      return body.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTaskInput;
    }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await readJson<{ task: Task }>(response);
      return body.task;
    },
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!response.ok) await readJson(response);
      return task;
    },
    onSuccess: (task) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/**
 * Drag-and-drop moves, applied optimistically.
 *
 * The card has to land in its new column on the same frame the finger lifts, so
 * the cache is patched before the request goes out and rolled back from the
 * snapshot if the server disagrees.
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTaskStatusInput;
    }) => {
      const response = await fetch(`/api/tasks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await readJson<{ task: Task }>(response);
      return body.task;
    },
    onMutate: async ({ id, input }) => {
      // Stop in-flight refetches from landing on top of the optimistic patch.
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueriesData<Task[]>({
        queryKey: taskKeys.lists(),
      });

      updateTaskInLists(queryClient, (task) =>
        task.id === id
          ? {
              ...task,
              status: input.status,
              position: input.position ?? task.position,
            }
          : task,
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      );
    },
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
