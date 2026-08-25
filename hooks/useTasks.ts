"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ApiError,
  Task,
  TaskFilters,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";
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

function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.search || filters.q) params.set("search", filters.search || filters.q!);
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

function matchesFilters(task: Task, filters: TaskFilters): boolean {
  const search = (filters.search || filters.q || "").toLowerCase();
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

function updateTaskInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (task: Task, filters: TaskFilters) => Task | null,
) {
  queryClient
    .getQueryCache()
    .findAll({ queryKey: taskKeys.lists() })
    .forEach((query) => {
      const filters = (query.queryKey[2] ?? {}) as TaskFilters;
      queryClient.setQueryData<Task[]>(query.queryKey, (current) => {
    if (!current) return current;
    const next = current
      .map((task) => updater(task, filters))
      .filter((task): task is Task => Boolean(task))
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
    mutationFn: async ({ id, input }: { id: string; input: UpdateTaskInput }) => {
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
      const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!response.ok) await readJson(response);
      return task;
    },
    onSuccess: (task) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

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
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueriesData<Task[]>({
        queryKey: taskKeys.lists(),
      });

      updateTaskInLists(queryClient, (task) =>
        task.id === id
          ? {
              ...task,
              status: input.status as TaskStatus,
              position: input.position ?? task.position,
            }
          : task,
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
