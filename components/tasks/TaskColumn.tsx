"use client";

import type { ReactNode } from "react";

import { Circle, MoreHorizontal, Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_META, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskColumnProps {
  status: TaskStatus;
  count: number;
  isOver?: boolean;
  onNewTask?: () => void;
  className?: string;
  children?: ReactNode;
}

const DOT: Record<TaskStatus, string> = {
  todo: "text-progress",
  in_progress: "text-amber",
  done: "text-done",
};

const OVER_STATE: Record<TaskStatus, string> = {
  todo: "border-slate/60 bg-ink/[0.02]",
  in_progress: "border-amber bg-amber/[0.04]",
  done: "border-done bg-done/[0.04]",
};

export function TaskColumn({
  status,
  count,
  isOver = false,
  onNewTask,
  className,
  children,
}: TaskColumnProps) {
  const meta = STATUS_META[status];
  const headingId = `column-heading-${status}`;
  const panelId = `column-panel-${status}`;
  const { setNodeRef } = useDroppable({ id: status });
  const countLabel = count === 1 ? "1 task" : `${count} tasks`;

  return (
    <section
      ref={setNodeRef}
      id={panelId}
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-[22rem] flex-col rounded-[1.25rem] border border-line/80 bg-paper/78 p-3 shadow-panel backdrop-blur sm:min-h-[28rem] sm:rounded-[1.5rem] sm:p-4",
        "transition-colors duration-150 ease-out motion-reduce:transition-none",
        isOver ? OVER_STATE[status] : "",
        className,
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Circle
            aria-hidden="true"
            className={cn("h-2.5 w-2.5 fill-current", DOT[status])}
          />
          <h2
            id={headingId}
            className="font-display text-base font-bold tracking-tight text-ink"
          >
            {meta.label}
          </h2>
          <span className="ml-1 rounded-full bg-line/80 px-2 py-0.5 font-mono text-xs font-bold text-slate">
            {count}
          </span>
        </div>

        {status === "todo" && onNewTask ? (
          <Button variant="ghost" size="sm" onClick={onNewTask} className="h-8 shrink-0 rounded-lg px-2">
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            New task
          </Button>
        ) : (
          <button
            type="button"
            aria-label={`${meta.label} options`}
            title={`${meta.label} options`}
            onClick={() =>
              toast.info(`${meta.label} has ${countLabel.toLowerCase()}.`)
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none"
          >
            <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </header>

      {count > 0 ? (
        <ul className="flex flex-1 flex-col gap-3">{children}</ul>
      ) : status === "todo" ? (
        // Only To Do gets the full call to action -- an empty In Progress or
        // Done column is a normal state, not something to prompt about.
        <EmptyState
          title="Open the first task"
          message={meta.emptyState}
          action={onNewTask ? { label: "New task", onClick: onNewTask } : undefined}
        />
      ) : (
        <p className="py-10 text-center font-body text-sm font-medium text-slate">
          {meta.emptyState}
        </p>
      )}
    </section>
  );
}
