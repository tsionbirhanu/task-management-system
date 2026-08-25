"use client";

import { GripVertical } from "lucide-react";

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

/**
 * The signature element: a numbered work order that reads like a ticket stub.
 * A priority-colored edge bar, the ticket number in mono above a perforated
 * hairline, then the title and its metadata chips.
 */
export interface TaskCardProps {
  task: Task;
  /** Keyboard/screen-reader path for moving a ticket, parallel to dragging. */
  onStatusChange?: (status: TaskStatus) => void;
  onOpen?: () => void;
  /** True while dnd-kit is dragging this card: lift it off the rail. */
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
  onOpen,
  isDragging = false,
  className,
}: TaskCardProps) {
  const ticket = formatTicketNumber(task.ticket_number);

  return (
    <article
      aria-label={`${ticket} ${task.title}`}
      className={cn(
        "group relative overflow-hidden rounded-md border border-line bg-paper",
        "shadow-ticket transition-shadow duration-150 ease-out",
        isDragging
          ? "scale-[1.02] border-amber shadow-lift"
          : "hover:border-slate/30",
        className,
      )}
    >
      {/* Priority accent: the torn edge of the stub. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          PRIORITY_ACCENT[task.priority],
        )}
      />

      <div className="pl-4">
        <div className="perforation flex items-center justify-between gap-2 px-3 py-2">
          <span className="font-mono text-[11px] font-medium tracking-wider text-slate">
            {ticket}
          </span>
          <GripVertical
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 text-slate/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />
        </div>

        <div className="px-3 py-2.5">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="text-left font-body text-sm font-medium text-ink hover:underline"
            >
              {task.title}
            </button>
          ) : (
            <h3 className="font-body text-sm font-medium text-ink">
              {task.title}
            </h3>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2.5">
          <DueBadge dueDate={task.due_date} />
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Accessibility floor: the board is fully operable without dragging. */}
        {onStatusChange ? (
          <div className="border-t border-line px-3 py-2">
            <Select
              label={`Move ${ticket} to another column`}
              srOnlyLabel
              value={task.status}
              onChange={(event) =>
                onStatusChange(event.target.value as TaskStatus)
              }
              className="h-8 border-transparent bg-transparent pl-2 text-xs text-slate hover:border-line"
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>
    </article>
  );
}
