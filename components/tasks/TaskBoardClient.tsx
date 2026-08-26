"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Plus,
  TimerReset,
} from "lucide-react";
import { addHours, isPast, isWithinInterval } from "date-fns";
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
const DUE_SOON_TOAST_KEY = "workbench:due-soon-toast-shown";

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
  const checkedDueSoonToast = useRef(false);

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
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const search = filters.search ?? filters.q;
  const hasActiveFilters = Boolean(
    search || filters.status || filters.priority,
  );
  const reminders = useMemo(() => getReminderTasks(tasks), [tasks]);
  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      dueSoon: reminders.dueSoon.length,
      overdue: reminders.overdue.length,
      done: tasks.filter((task) => task.status === "done").length,
    }),
    [reminders.dueSoon.length, reminders.overdue.length, tasks],
  );

  useEffect(() => {
    if (
      checkedDueSoonToast.current ||
      tasksQuery.isLoading ||
      tasksQuery.isError
    ) {
      return;
    }

    checkedDueSoonToast.current = true;

    if (window.sessionStorage.getItem(DUE_SOON_TOAST_KEY)) {
      return;
    }

    window.sessionStorage.setItem(DUE_SOON_TOAST_KEY, "true");

    if (reminders.dueSoon.length > 0) {
      const count = reminders.dueSoon.length;
      toast.warning(
        `${count} ${count === 1 ? "task is" : "tasks are"} due within 24h`,
      );
    }
  }, [reminders.dueSoon.length, tasksQuery.isError, tasksQuery.isLoading]);

  useEffect(() => {
    if (!tasksQuery.isError) return;

    toast.error(
      tasksQuery.error instanceof Error
        ? tasksQuery.error.message
        : "Tasks did not load. Refresh the board and try again.",
    );
  }, [tasksQuery.error, tasksQuery.isError]);

  useEffect(() => {
    function showReminderSummary(event: Event) {
      const reminderEvent = event as CustomEvent<{
        handled?: boolean;
        summary?: {
          overdue: number;
          dueSoon: number;
          loading?: boolean;
          error?: boolean;
        } | null;
      }>;
      if (!reminderEvent.detail) return;

      reminderEvent.detail.handled = true;

      if (tasksQuery.isLoading) {
        reminderEvent.detail.summary = {
          overdue: 0,
          dueSoon: 0,
          loading: true,
        };
        return;
      }

      if (tasksQuery.isError) {
        reminderEvent.detail.summary = {
          overdue: 0,
          dueSoon: 0,
          error: true,
        };
        return;
      }

      reminderEvent.detail.summary = {
        overdue: reminders.overdue.length,
        dueSoon: reminders.dueSoon.length,
      };
    }

    window.addEventListener("workbench:show-reminders", showReminderSummary);
    return () =>
      window.removeEventListener("workbench:show-reminders", showReminderSummary);
  }, [
    reminders.dueSoon.length,
    reminders.overdue.length,
    tasksQuery.isError,
    tasksQuery.isLoading,
  ]);

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
        error instanceof Error ? error.message : "Task move did not save.",
      );
    }
  }

  return (
    <main className="bg-blueprint flex-1">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Good morning, Tsion!
              </h1>
              <p className="mt-1 font-body text-sm font-medium text-slate">
                Here&apos;s what needs your attention today.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={openCreate}
              className="h-11 self-start rounded-xl px-5 sm:self-auto"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New task
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatPill
              icon={<Clock3 aria-hidden="true" className="h-3.5 w-3.5" />}
              label="Total Tasks"
              value={stats.total}
              subtext={
                stats.overdue > 0
                  ? `${stats.overdue} overdue`
                  : "Everything on the board"
              }
            />
            <StatPill
              icon={<TimerReset aria-hidden="true" className="h-3.5 w-3.5" />}
              label="To Do"
              value={stats.todo}
              subtext={`${percent(stats.todo, stats.total)}% of total`}
              tone="progress"
            />
            <StatPill
              icon={<AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />}
              label="In Progress"
              value={stats.inProgress}
              subtext={`${percent(stats.inProgress, stats.total)}% of total`}
              tone="amber"
            />
            <StatPill
              icon={<CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />}
              label="Completed"
              value={stats.done}
              subtext={`${percent(stats.done, stats.total)}% of total`}
              tone="done"
            />
          </div>
        </section>

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
        ) : tasksQuery.isLoading ? (
          <TaskBoardSkeleton view={view} />
        ) : !tasksQuery.isLoading && tasks.length === 0 && hasActiveFilters ? (
          <EmptyState
            title="No matching tasks"
            message={
              search
                ? `No tasks match "${search}". Try a different search or clear your filters.`
                : "No tasks match these filters. Try another status or clear your filters."
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

function TaskBoardSkeleton({ view }: { view: BoardView }) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-2" aria-label="Loading tasks">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonTicket key={index} compact />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      aria-label="Loading board"
    >
      {TASK_STATUSES.map((status) => (
        <section
          key={status}
          className="flex min-h-[28rem] flex-col rounded-[1.15rem] border border-line bg-paper/75 p-3 shadow-ticket"
        >
          <div className="mb-3 border-b-2 border-b-line pb-3">
            <div className="h-4 w-24 rounded bg-line/80" />
            <div className="mt-2 h-3 w-16 rounded bg-line/60" />
          </div>
          <div className="flex flex-col gap-2">
            <SkeletonTicket />
            <SkeletonTicket />
          </div>
        </section>
      ))}
    </div>
  );
}

function SkeletonTicket({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-line bg-paper shadow-ticket ${
        compact ? "p-3" : "pl-4"
      }`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-line" />
      <div className={compact ? "" : "px-3 py-3"}>
        <div className="h-3 w-20 rounded bg-line/80" />
        <div className="mt-3 h-4 w-3/4 rounded bg-line/70" />
        <div className="mt-2 h-3 w-full rounded bg-line/50" />
        <div className="mt-2 h-3 w-2/3 rounded bg-line/50" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-16 rounded bg-line/60" />
          <div className="h-6 w-20 rounded bg-line/60" />
        </div>
      </div>
    </div>
  );
}

function getReminderTasks(tasks: Task[]) {
  const now = new Date();
  const dueSoonEnd = addHours(now, 24);
  const overdue: Task[] = [];
  const dueSoon: Task[] = [];

  for (const task of tasks) {
    if (!task.due_date || task.status === "done") continue;

    const due = new Date(task.due_date);
    if (Number.isNaN(due.getTime())) continue;

    if (isPast(due)) {
      overdue.push(task);
    } else if (isWithinInterval(due, { start: now, end: dueSoonEnd })) {
      dueSoon.push(task);
    }
  }

  return { overdue, dueSoon };
}

function StatPill({
  icon,
  label,
  value,
  subtext,
  tone = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  tone?: "slate" | "progress" | "amber" | "danger" | "done";
}) {
  const toneClass = {
    slate: "border-line bg-paper",
    progress: "border-line bg-paper",
    amber: "border-line bg-paper",
    danger: "border-line bg-paper",
    done: "border-line bg-paper",
  }[tone];
  const iconWrap = {
    slate: "bg-progress/10 text-progress",
    progress: "bg-progress/10 text-progress",
    amber: "bg-amber/15 text-amber",
    danger: "bg-danger/10 text-danger",
    done: "bg-done/12 text-done",
  }[tone];

  return (
    <div
      className={`flex min-h-28 items-center gap-4 rounded-2xl border p-5 shadow-ticket ${toneClass}`}
    >
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${iconWrap}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-body text-xs font-bold text-slate">
          {label}
        </span>
        <span className="mt-1 block font-mono text-3xl font-bold leading-none text-ink">
          {value}
        </span>
        <span className="mt-2 block font-body text-xs font-medium text-slate">
          {subtext}
        </span>
      </span>
    </div>
  );
}

function percent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value) params.set(key, value);
  else params.delete(key);
}
