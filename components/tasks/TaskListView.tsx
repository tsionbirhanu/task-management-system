"use client";

import { ArrowDownUp, Edit2, Trash2 } from "lucide-react";

import { DueBadge } from "@/components/tasks/DueBadge";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  STATUS_META,
  formatTicketNumber,
  type Task,
  type TaskFilters,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskListViewProps {
  tasks?: Task[];
  sort: NonNullable<TaskFilters["sort"]>;
  onSortChange: (sort: NonNullable<TaskFilters["sort"]>) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

export function TaskListView({
  tasks = [],
  sort,
  onSortChange,
  onEditTask,
  onDeleteTask,
}: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No matching tasks"
        message="No tasks match these filters. Clear the search or add a new task."
      />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2 sm:hidden" aria-label="All tasks">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="rounded-2xl border border-line bg-paper px-3 py-3 shadow-ticket"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate">
                  {formatTicketNumber(task.ticket_no)}
                </p>
                <h3 className="mt-1 line-clamp-2 font-body text-sm font-semibold leading-5 text-ink">
                  {task.title}
                </h3>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  label={`Edit task ${formatTicketNumber(task.ticket_no)}`}
                  onClick={() => onEditTask?.(task)}
                >
                  <Edit2 aria-hidden="true" className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  label={`Delete task ${formatTicketNumber(task.ticket_no)}`}
                  onClick={() => onDeleteTask?.(task)}
                  danger
                >
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>

            {task.description ? (
              <p className="mt-1.5 line-clamp-2 font-body text-xs leading-5 text-slate">
                {task.description}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-line bg-ink/[0.035] px-2 py-1 font-body text-xs font-semibold text-slate">
                {STATUS_META[task.status].label}
              </span>
              <PriorityBadge priority={task.priority} />
              <DueBadge dueDate={task.due_date} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-[1.15rem] border border-line bg-paper/85 shadow-ticket sm:block">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <caption className="sr-only">All tasks</caption>
          <thead>
            <tr className="border-b border-line">
              <Th className="w-28">Task ID</Th>
              <Th sortKey="created_at" activeSort={sort} onSortChange={onSortChange}>
                Title
              </Th>
              <Th className="w-32">Status</Th>
              <Th
                className="w-28"
                sortKey="priority"
                activeSort={sort}
                onSortChange={onSortChange}
              >
                Priority
              </Th>
              <Th
                className="w-40"
                sortKey="due_date"
                activeSort={sort}
                onSortChange={onSortChange}
              >
                Due
              </Th>
              <Th className="w-24 text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
              className="border-b border-line/70 last:border-b-0 hover:bg-progress/[0.025]"
              >
                <td className="px-3 py-2.5 font-mono text-xs text-slate">
                  {formatTicketNumber(task.ticket_no)}
                </td>
                <td className="px-3 py-2.5">
                  <p className="font-body text-sm font-medium text-ink">{task.title}</p>
                  {task.description ? (
                    <p className="mt-0.5 line-clamp-1 font-body text-xs text-slate">
                      {task.description}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 font-body text-sm text-slate">
                  {STATUS_META[task.status].label}
                </td>
                <td className="px-3 py-2.5">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-3 py-2.5">
                  <DueBadge dueDate={task.due_date} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end gap-1">
                    <IconButton
                      label={`Edit task ${formatTicketNumber(task.ticket_no)}`}
                      onClick={() => onEditTask?.(task)}
                    >
                      <Edit2 aria-hidden="true" className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label={`Delete task ${formatTicketNumber(task.ticket_no)}`}
                      onClick={() => onDeleteTask?.(task)}
                      danger
                    >
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Th({
  children,
  className,
  sortKey,
  activeSort,
  onSortChange,
}: {
  children: React.ReactNode;
  className?: string;
  sortKey?: NonNullable<TaskFilters["sort"]>;
  activeSort?: NonNullable<TaskFilters["sort"]>;
  onSortChange?: (sort: NonNullable<TaskFilters["sort"]>) => void;
}) {
  const sortable = Boolean(sortKey && onSortChange);
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-3 font-display text-[11px] font-bold uppercase tracking-wide text-slate",
        className,
      )}
    >
      {sortable ? (
        <button
          type="button"
          onClick={() => onSortChange?.(sortKey!)}
          className={cn(
            "inline-flex items-center gap-1 rounded text-left transition-colors duration-150 hover:text-ink",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
            activeSort === sortKey && "text-ink",
          )}
        >
          {children}
          <ArrowDownUp aria-hidden="true" className="h-3 w-3" />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

function IconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick?: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded border border-transparent",
        "transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        danger
          ? "text-danger hover:border-danger/30 hover:bg-danger/10"
          : "text-slate hover:border-line hover:bg-ink/[0.04] hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
