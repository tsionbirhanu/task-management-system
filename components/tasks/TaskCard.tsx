"use client";

import {
  CalendarDays,
  CheckCircle2,
  Edit2,
  GripVertical,
  Trash2,
} from "lucide-react";
import { format, isPast } from "date-fns";

import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import {
  formatTicketNumber,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
  className?: string;
}

const PRIORITY_ACCENT: Record<TaskPriority, string> = {
  high: "bg-danger",
  medium: "bg-amber",
  low: "bg-done",
};

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-progress",
  in_progress: "bg-amber",
  done: "bg-done",
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging = false,
  className,
}: TaskCardProps) {
  const ticket = formatTicketNumber(task.ticket_no);
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const dueLabel =
    dueDate && !Number.isNaN(dueDate.getTime())
      ? format(dueDate, "MMM d, yyyy")
      : "No due date";
  const isOverdue =
    task.status !== "done" &&
    dueDate !== null &&
    !Number.isNaN(dueDate.getTime()) &&
    isPast(dueDate);

  return (
    <article
      aria-label={`${ticket} ${task.title}`}
      className={cn(
        "group relative cursor-grab rounded-2xl border border-line/90 bg-paper p-4 active:cursor-grabbing",
        "shadow-ticket transition duration-150 ease-out motion-reduce:transition-none",
        isDragging
          ? "scale-[1.02] opacity-95 shadow-lift motion-reduce:scale-100 motion-reduce:shadow-ticket"
          : "hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0",
        isOverdue && "border-danger/20 bg-danger/[0.025]",
        className,
      )}
    >
      {isOverdue ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-danger"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", STATUS_DOT[task.status])}
            />
            <div className="min-w-0">
              <div className="flex items-start gap-2">
                <h3
                  className={cn(
                    "line-clamp-2 font-body text-[15px] font-bold leading-5 text-ink",
                    task.status === "done" &&
                      "text-slate line-through decoration-done decoration-2",
                  )}
                >
                  {task.title}
                </h3>
                {task.status === "done" ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 fill-done text-paper"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <span
            title="Drag to move"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate/55 transition-colors duration-150 group-hover:bg-ink/[0.035] group-hover:text-slate"
          >
            <span className="sr-only">Drag task to move</span>
            <GripVertical aria-hidden="true" className="h-4 w-4" />
          </span>
          <IconButton label={`Edit task ${ticket}`} onClick={onEdit}>
            <Edit2 aria-hidden="true" className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label={`Delete task ${ticket}`} onClick={onDelete} danger>
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      {task.description ? (
        <p className="mt-3 line-clamp-3 font-body text-xs leading-5 text-slate">
          {task.description}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-slate">
          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-slate/70" />
          {dueLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_ACCENT[task.priority])}
          />
          <PriorityBadge priority={task.priority} />
        </span>
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
        "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent",
        "transition-colors duration-150 ease-out focus-visible:outline-none",
        danger
          ? "text-danger hover:border-danger/30 hover:bg-danger/10"
          : "text-slate hover:border-line hover:bg-ink/[0.04] hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
