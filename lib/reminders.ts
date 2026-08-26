import { addHours } from "date-fns";

import type { Task } from "@/lib/types";

/** How far ahead a deadline counts as "due soon". */
export const DUE_SOON_HOURS = 24;

export interface ReminderTasks {
  overdue: Task[];
  dueSoon: Task[];
}

export interface ReminderSummary {
  overdue: number;
  dueSoon: number;
}

/**
 * The deadline as a Date, or null when there isn't one or the stored value is
 * unparseable. Every due-date reader goes through here so "no deadline" and
 * "bad data" collapse into the same harmless case exactly once.
 */
export function parseDueDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const due = new Date(value);
  return Number.isNaN(due.getTime()) ? null : due;
}

/**
 * Past its deadline and not finished.
 *
 * Finished tickets are never overdue no matter how late they were -- the work
 * is done, and flagging it red would be nagging about history.
 */
export function isTaskOverdue(
  task: Pick<Task, "due_date" | "status">,
  now: Date = new Date(),
): boolean {
  if (task.status === "done") return false;
  const due = parseDueDate(task.due_date);
  return due !== null && due.getTime() < now.getTime();
}

/**
 * Split open tickets into overdue and due-soon.
 *
 * `now` is a parameter rather than a call to `new Date()` inside the loop so a
 * caller can pin the clock, and so every ticket in one pass is judged against
 * the same instant.
 */
export function getReminderTasks(
  tasks: Task[],
  now: Date = new Date(),
): ReminderTasks {
  const dueSoonEnd = addHours(now, DUE_SOON_HOURS);
  const overdue: Task[] = [];
  const dueSoon: Task[] = [];

  for (const task of tasks) {
    if (task.status === "done") continue;

    const due = parseDueDate(task.due_date);
    if (!due) continue;

    if (due.getTime() < now.getTime()) overdue.push(task);
    else if (due.getTime() < dueSoonEnd.getTime()) dueSoon.push(task);
  }

  return { overdue, dueSoon };
}

/** Counts only -- the shape the notification bell and the toast consume. */
export function summarizeReminders(tasks: Task[]): ReminderSummary {
  const { overdue, dueSoon } = getReminderTasks(tasks);
  return { overdue: overdue.length, dueSoon: dueSoon.length };
}
