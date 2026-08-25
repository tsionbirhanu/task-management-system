"use client";

import type { ReactNode } from "react";

import { STATUS_META, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskColumnProps {
  status: TaskStatus;
  count: number;
  /** True while a dragged card hovers this column. */
  isOver?: boolean;
  children?: ReactNode;
}

/**
 * Columns stay neutral -- a hairline border and a status-colored underline on
 * the header, never a colored background. That keeps the priority accent on
 * each ticket the loudest color in the column.
 */
const UNDERLINE: Record<TaskStatus, string> = {
  todo: "border-b-slate/50",
  in_progress: "border-b-amber",
  done: "border-b-done",
};

export function TaskColumn({
  status,
  count,
  isOver = false,
  children,
}: TaskColumnProps) {
  const meta = STATUS_META[status];
  const headingId = `column-heading-${status}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-[16rem] flex-col rounded-lg border bg-paper/60 p-3",
        "transition-colors duration-150 ease-out",
        isOver ? "border-amber bg-amber/[0.04]" : "border-line",
      )}
    >
      <header
        className={cn(
          "mb-3 flex items-baseline justify-between gap-2 border-b-2 pb-2",
          UNDERLINE[status],
        )}
      >
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
      </header>

      {count === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-line px-4 py-8 text-center font-body text-sm text-slate">
          {meta.emptyState}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">{children}</ul>
      )}
    </section>
  );
}
