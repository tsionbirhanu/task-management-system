"use client";

import type { ReactNode } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_META, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskColumnProps {
  status: TaskStatus;
  count: number;
  isOver?: boolean;
  onNewTask?: () => void;
  children?: ReactNode;
}

const UNDERLINE: Record<TaskStatus, string> = {
  todo: "border-b-slate/50",
  in_progress: "border-b-amber",
  done: "border-b-done",
};

export function TaskColumn({
  status,
  count,
  isOver = false,
  onNewTask,
  children,
}: TaskColumnProps) {
  const meta = STATUS_META[status];
  const headingId = `column-heading-${status}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-[24rem] flex-col rounded-lg border bg-paper/70 p-3",
        "transition-colors duration-150 ease-out",
        isOver ? "border-amber bg-amber/[0.04]" : "border-line",
      )}
    >
      <header
        className={cn(
          "mb-3 flex items-center justify-between gap-2 border-b-2 pb-2",
          UNDERLINE[status],
        )}
      >
        <div className="flex items-baseline gap-2">
          <h2
            id={headingId}
            className="font-display text-sm font-semibold uppercase tracking-wide text-ink"
          >
            {meta.label}
          </h2>
          <span
            className="font-mono text-xs text-slate"
            aria-label={`${count} tickets`}
          >
            {String(count).padStart(2, "0")}
          </span>
        </div>

        {status === "todo" && onNewTask ? (
          <Button variant="ghost" size="sm" onClick={onNewTask}>
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            New ticket
          </Button>
        ) : null}
      </header>

      {count === 0 ? (
        <EmptyState title={meta.label} message={meta.emptyState} />
      ) : (
        <ul className="flex flex-col gap-2">{children}</ul>
      )}
    </section>
  );
}
