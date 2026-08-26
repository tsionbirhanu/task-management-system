"use client";

import { useCallback, useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  isBoardView,
  isTaskPriority,
  isTaskSort,
  isTaskStatus,
  type BoardView,
  type TaskFilters,
  type TaskSort,
} from "@/lib/types";

const DEFAULT_VIEW: BoardView = "board";
const DEFAULT_SORT: TaskSort = "created_at";

export interface BoardParamsUpdate {
  filters?: TaskFilters;
  view?: BoardView;
  sort?: TaskSort;
}

export interface BoardParams {
  filters: TaskFilters;
  view: BoardView;
  sort: TaskSort;
  /** True when a search, status, or priority is narrowing the board. */
  hasActiveFilters: boolean;
  setParams: (next: BoardParamsUpdate) => void;
  clearFilters: () => void;
}

/**
 * The board's state, kept in the URL rather than in React state.
 *
 * That is the whole point of this hook: a filtered board is a link someone can
 * bookmark, share, or reload without losing where they were. Defaults are
 * omitted from the query string so the common case stays a clean `/board`.
 */
export function useBoardParams(): BoardParams {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get("search");
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");
  const viewParam = searchParams.get("view");
  const sortParam = searchParams.get("sort");

  const view = isBoardView(viewParam) ? viewParam : DEFAULT_VIEW;
  const sort = isTaskSort(sortParam) ? sortParam : DEFAULT_SORT;

  const filters = useMemo<TaskFilters>(
    () => ({
      search: searchParam || undefined,
      status: isTaskStatus(statusParam) ? statusParam : undefined,
      priority: isTaskPriority(priorityParam) ? priorityParam : undefined,
      sort,
    }),
    [priorityParam, searchParam, sort, statusParam],
  );

  const setParams = useCallback(
    (next: BoardParamsUpdate) => {
      const params = new URLSearchParams(searchParams);
      const nextFilters = next.filters ?? filters;
      const nextView = next.view ?? view;
      const nextSort = next.sort ?? sort;

      setParam(params, "search", nextFilters.search);
      setParam(params, "status", nextFilters.status);
      setParam(params, "priority", nextFilters.priority);
      setParam(params, "view", nextView === DEFAULT_VIEW ? undefined : nextView);
      setParam(params, "sort", nextSort === DEFAULT_SORT ? undefined : nextSort);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router, searchParams, sort, view],
  );

  const clearFilters = useCallback(
    () => setParams({ filters: {}, sort: DEFAULT_SORT }),
    [setParams],
  );

  return {
    filters,
    view,
    sort,
    hasActiveFilters: Boolean(
      filters.search || filters.status || filters.priority,
    ),
    setParams,
    clearFilters,
  };
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value) params.set(key, value);
  else params.delete(key);
}
