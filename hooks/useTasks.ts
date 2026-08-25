"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError, Task, TaskFilters } from "@/lib/types";

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
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchTasks(filters: TaskFilters): Promise<Task[]> {
  const response = await fetch(`/api/tasks${buildQueryString(filters)}`);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(
      body?.error?.message ??
        "Could not load your tickets. Check your connection and try again.",
    );
  }

  const body = (await response.json()) as { tasks: Task[] };
  return body.tasks;
}

/**
 * Scaffold: the list query only. Create, update, status-move, and delete
 * mutations -- with optimistic updates and rollback -- land alongside the API
 * routes in the next phase.
 */
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchTasks(filters),
  });
}
