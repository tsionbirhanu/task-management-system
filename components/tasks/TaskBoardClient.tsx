"use client";

import { useMemo, useState } from "react";

import { AlertCircle, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";
import {
  FilterBar,
  type BoardView,
  type TaskSort,
} from "@/components/tasks/FilterBar";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { TaskListView } from "@/components/tasks/TaskListView";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";

const SORTS = ["created_at", "due_date", "priority"] as const;

function isView(value: string | null): value is BoardView {
  return value === "board" || value === "list";
}

function isStatus(value: string | null): value is TaskStatus {
  return TASK_STATUSES.some((status) => status === value);
}

function isPriority(value: string | null): value is TaskPriority {
  return TASK_PRIORITIES.some((priority) => priority === value);
}

function isSort(value: string | null): value is TaskSort {
  return SORTS.some((sort) => sort === value);
}

export function TaskBoardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const viewParam = searchParams.get("view");
  const sortParam = searchParams.get("sort");
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");

  const view: BoardView = isView(viewParam) ? viewParam : "board";
  const sort: TaskSort = isSort(sortParam) ? sortParam : "created_at";

  const filters = useMemo<TaskFilters>(
    () => ({
      q: searchParams.get("search") || undefined,
      search: searchParams.get("search") || undefined,
      status: isStatus(statusParam) ? statusParam : undefined,
      priority: isPriority(priorityParam) ? priorityParam : undefined,
      sort,
    }),
    [priorityParam, searchParams, sort, statusParam],
  );

  const tasksQuery = useTasks(filters);
  const updateStatus = useUpdateTaskStatus();
  const tasks = tasksQuery.data ?? [];
  const search = filters.search ?? filters.q;
  const hasActiveFilters = Boolean(
    search || filters.status || filters.priority,
  );

  function setParams(next: {
    filters?: TaskFilters;
    view?: BoardView;
    sort?: TaskSort;
  }) {
    const params = new URLSearchParams(searchParams);
    const nextFilters = next.filters ?? filters;
    const nextView = next.view ?? view;
    const nextSort = next.sort ?? sort;

    setParam(params, "search", nextFilters.q || nextFilters.search);
    setParam(params, "status", nextFilters.status);
    setParam(params, "priority", nextFilters.priority);
    setParam(params, "view", nextView === "board" ? undefined : nextView);
    setParam(params, "sort", nextSort === "created_at" ? undefined : nextSort);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  async function moveTask(task: Task, status: TaskStatus, position?: number) {
    if (task.status === status && position === undefined) return;
    const columnSize = tasks.filter((item) => item.status === status).length;

    try {
      await updateStatus.mutateAsync({
        id: task.id,
        input: { status, position: position ?? columnSize + 1 },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ticket move did not save.",
      );
    }
  }

  return (
    <main className="bg-blueprint flex-1">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Board
            </h1>
            <p className="mt-1 font-body text-sm text-slate">
              Every task is a numbered work order. Move it right as the work
              moves forward.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={openCreate}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            New ticket
          </Button>
        </div>

        <div className="rounded-lg border border-line bg-paper/80 p-3">
          <FilterBar
            filters={filters}
            onFiltersChange={(nextFilters) =>
              setParams({ filters: nextFilters })
            }
            sort={sort}
            onSortChange={(nextSort) => setParams({ sort: nextSort })}
            view={view}
            onViewChange={(nextView) => setParams({ view: nextView })}
          />
        </div>

        {tasksQuery.isError ? (
          <EmptyState
            icon={<AlertCircle aria-hidden="true" className="h-4 w-4" />}
            title="Tasks did not load"
            message={
              tasksQuery.error instanceof Error
                ? tasksQuery.error.message
                : "Refresh the board and try again."
            }
            action={{ label: "Retry", onClick: () => tasksQuery.refetch() }}
          />
        ) : !tasksQuery.isLoading && tasks.length === 0 && hasActiveFilters ? (
          <EmptyState
            title="No matching tickets"
            message={
              search
                ? `No tickets match "${search}". Try a different search or clear your filters.`
                : "No tickets match these filters. Try another status or clear your filters."
            }
            action={{
              label: "Clear filters",
              onClick: () =>
                setParams({
                  filters: {
                    search: undefined,
                    q: undefined,
                    status: undefined,
                    priority: undefined,
                  },
                  sort: "created_at",
                }),
            }}
          />
        ) : view === "list" ? (
          <TaskListView
            tasks={tasks}
            sort={sort}
            onSortChange={(nextSort) => setParams({ sort: nextSort })}
            onEditTask={openEdit}
            onDeleteTask={setDeletingTask}
          />
        ) : (
          <TaskBoard
            tasks={tasks}
            onNewTask={openCreate}
            onEditTask={openEdit}
            onDeleteTask={setDeletingTask}
            onStatusChange={moveTask}
          />
        )}

        {tasksQuery.isLoading ? (
          <p className="font-body text-sm text-slate">Loading tickets...</p>
        ) : null}
      </div>

      <TaskFormModal
        open={formOpen}
        task={editingTask}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
      />
      <DeleteConfirmDialog
        open={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
      />
    </main>
  );
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value) params.set(key, value);
  else params.delete(key);
}
