"use client";

import { Edit2, GripVertical, Trash2 } from "lucide-react";

import { DueBadge } from "@/components/tasks/DueBadge";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { Select } from "@/components/ui/Select";
import {
  STATUS_META,
  TASK_STATUSES,
  formatTicketNumber,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskCardProps {
  task: Task;
  onStatusChange?: (status: TaskStatus) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
  className?: string;
}

const PRIORITY_ACCENT: Record<TaskPriority, string> = {
  high: "bg-danger",
  medium: "bg-amber",
  low: "bg-slate/40",
};

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  isDragging = false,
  className,
}: TaskCardProps) {
  const ticket = formatTicketNumber(task.ticket_no);

  return (
    <article
      aria-label={`${ticket} ${task.title}`}
      className={cn(
        "group relative overflow-hidden rounded-md border border-line bg-paper",
        "shadow-ticket transition duration-150 ease-out",
        isDragging
          ? "scale-[1.02] border-amber shadow-lift"
          : "hover:border-slate/30 hover:shadow-lift",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1", PRIORITY_ACCENT[task.priority])}
      />
      <span
        aria-hidden="true"
        className="absolute left-9 top-[2.35rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-line bg-paper"
      />
      <span
        aria-hidden="true"
        className="absolute right-3 top-[2.35rem] h-2.5 w-2.5 translate-x-1/2 rounded-full border border-line bg-paper"
      />

      <div className="pl-4">
        <div className="perforation flex items-center justify-between gap-2 px-3 py-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate">
            {ticket}
          </span>
          <GripVertical
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 text-slate/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />
        </div>

        <div className="px-3 py-2.5">
          <h3 className="line-clamp-2 font-body text-sm font-medium text-ink">
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-1 line-clamp-2 font-body text-xs leading-5 text-slate">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-3 py-2.5">
          <PriorityBadge priority={task.priority} />
          <DueBadge dueDate={task.due_date} />

          {onStatusChange ? (
            <Select
              label={`Move ${ticket} to another column`}
              srOnlyLabel
              value={task.status}
              onChange={(event) =>
                onStatusChange(event.target.value as TaskStatus)
              }
              className="h-7 min-w-28 border-line bg-paper pl-2 pr-7 font-body text-xs text-slate"
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </Select>
          ) : null}

          <div className="ml-auto flex items-center gap-1">
            <IconButton label={`Edit ${ticket}`} onClick={onEdit}>
              <Edit2 aria-hidden="true" className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton label={`Delete ${ticket}`} onClick={onDelete} danger>
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
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
