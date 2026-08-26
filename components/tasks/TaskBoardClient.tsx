"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { BoardCalendar } from "@/components/tasks/BoardCalendar";
import { BoardHeader } from "@/components/tasks/BoardHeader";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";
import { FilterBar } from "@/components/tasks/FilterBar";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskBoardSkeleton } from "@/components/tasks/TaskBoardSkeleton";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { TaskListView } from "@/components/tasks/TaskListView";
import { EmptyState } from "@/components/ui/EmptyState";
import { useBoardParams } from "@/hooks/useBoardParams";
import { useReminders, useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import type { Task, TaskStatus } from "@/lib/types";

const DUE_SOON_TOAST_KEY = "workbench:due-soon-toast-shown";

export interface TaskBoardClientProps {
  /** Signed-in address, or null in preview mode. */
  email?: string | null;
}

/**
 * The board screen.
 *
 * Everything here is orchestration: read the URL, fetch, and hand the results
 * to the pieces that draw them. The drawing itself lives in BoardHeader,
 * FilterBar, TaskBoard/TaskListView and BoardCalendar.
 */
export function TaskBoardClient({ email = null }: TaskBoardClientProps) {
  const { filters, view, sort, hasActiveFilters, setParams, clearFilters } =
    useBoardParams();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const tasksQuery = useTasks(filters);
  const remindersQuery = useReminders();
  const updateStatus = useUpdateTaskStatus();
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  useDueSoonToast(remindersQuery.data?.dueSoon, remindersQuery.isSuccess);

  useEffect(() => {
    if (!tasksQuery.isError) return;

    toast.error(errorMessage(tasksQuery.error, "Tasks did not load."));
  }, [tasksQuery.error, tasksQuery.isError]);

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingTask(null);
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
      toast.error(errorMessage(error, "Task move did not save."));
    }
  }

  return (
    <main className="bg-blueprint flex-1">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <BoardHeader email={email} tasks={tasks} onNewTask={openCreate} />

        <div className="rounded-[1.15rem] border border-line/80 bg-paper/85 p-3 shadow-ticket backdrop-blur">
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

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
          <div className="min-w-0">
            <BoardBody
              tasks={tasks}
              view={view}
              sort={sort}
              search={filters.search}
              hasActiveFilters={hasActiveFilters}
              isLoading={tasksQuery.isLoading}
              isError={tasksQuery.isError}
              error={tasksQuery.error}
              onRetry={() => tasksQuery.refetch()}
              onClearFilters={clearFilters}
              onSortChange={(nextSort) => setParams({ sort: nextSort })}
              onNewTask={openCreate}
              onEditTask={openEdit}
              onDeleteTask={setDeletingTask}
              onStatusChange={moveTask}
            />
          </div>

          <aside className="hidden flex-col gap-4 xl:flex">
            <BoardCalendar tasks={tasks} />
          </aside>
        </div>
      </div>

      <TaskFormModal open={formOpen} task={editingTask} onClose={closeForm} />
      <DeleteConfirmDialog
        open={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
      />
    </main>
  );
}

interface BoardBodyProps {
  tasks: Task[];
  view: ReturnType<typeof useBoardParams>["view"];
  sort: ReturnType<typeof useBoardParams>["sort"];
  search: string | undefined;
  hasActiveFilters: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onClearFilters: () => void;
  onSortChange: (sort: BoardBodyProps["sort"]) => void;
  onNewTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (
    task: Task,
    status: TaskStatus,
    position?: number,
  ) => void | Promise<void>;
}

/**
 * Picks what the middle of the board shows: an error, a skeleton, a "nothing
 * matched" state, or the tickets. Split out so the states read as one ordered
 * list rather than as a ternary chain buried in the page.
 */
function BoardBody({
  tasks,
  view,
  sort,
  search,
  hasActiveFilters,
  isLoading,
  isError,
  error,
  onRetry,
  onClearFilters,
  onSortChange,
  onNewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: BoardBodyProps) {
  if (isError) {
    return (
      <EmptyState
        icon={<AlertCircle aria-hidden="true" className="h-4 w-4" />}
        title="Tasks did not load"
        message={errorMessage(error, "Refresh the board and try again.")}
        action={{ label: "Retry", onClick: onRetry }}
      />
    );
  }

  if (isLoading) return <TaskBoardSkeleton view={view} />;

  if (tasks.length === 0 && hasActiveFilters) {
    return (
      <EmptyState
        title="No matching tasks"
        message={
          search
            ? `No tasks match "${search}". Try a different search or clear your filters.`
            : "No tasks match these filters. Try another status or clear your filters."
        }
        action={{ label: "Clear filters", onClick: onClearFilters }}
      />
    );
  }

  if (view === "list") {
    return (
      <TaskListView
        tasks={tasks}
        sort={sort}
        onSortChange={onSortChange}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    );
  }

  return (
    <TaskBoard
      tasks={tasks}
      onNewTask={onNewTask}
      onEditTask={onEditTask}
      onDeleteTask={onDeleteTask}
      onStatusChange={onStatusChange}
    />
  );
}

/**
 * One due-soon nudge per browser session.
 *
 * The count comes from the unfiltered reminder query, so arriving on a filtered
 * board -- a bookmarked `?status=done`, say -- still warns you. sessionStorage
 * rather than state, so navigating back to the board does not re-nag.
 */
function useDueSoonToast(dueSoon: number | undefined, ready: boolean) {
  const alreadyChecked = useRef(false);

  useEffect(() => {
    if (alreadyChecked.current || !ready) return;
    alreadyChecked.current = true;

    if (window.sessionStorage.getItem(DUE_SOON_TOAST_KEY)) return;
    window.sessionStorage.setItem(DUE_SOON_TOAST_KEY, "true");

    if (!dueSoon) return;

    toast.warning(
      `${dueSoon} ${dueSoon === 1 ? "task is" : "tasks are"} due within 24h`,
    );
  }, [dueSoon, ready]);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
