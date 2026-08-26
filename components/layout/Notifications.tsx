"use client";

import type { ReactNode } from "react";

import { AlertCircle, Bell, CheckCircle2, Clock3, X } from "lucide-react";

import { useReminders } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

export interface NotificationSummary {
  overdue: number;
  dueSoon: number;
  loading?: boolean;
  error?: boolean;
}

/**
 * What the bell knows.
 *
 * Counts come from the unfiltered reminder query, so an overdue ticket stays
 * counted while the board is filtered to another status -- and so the bell has
 * its own data on any route instead of waiting to be told by the board.
 */
export function useNotificationSummary(): NotificationSummary {
  const remindersQuery = useReminders();

  if (remindersQuery.isLoading) return { overdue: 0, dueSoon: 0, loading: true };
  if (remindersQuery.isError) return { overdue: 0, dueSoon: 0, error: true };

  return remindersQuery.data ?? { overdue: 0, dueSoon: 0 };
}

/** Badge count, or 0 while the counts are unknown rather than a misleading number. */
export function notificationCount(summary: NotificationSummary): number {
  if (summary.loading || summary.error) return 0;
  return summary.overdue + summary.dueSoon;
}

export function NotificationButton({
  count,
  open,
  onClick,
}: {
  count: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={
        count > 0
          ? `Notifications, ${count} reminder${count === 1 ? "" : "s"}`
          : "Notifications"
      }
      title="Notifications"
      aria-expanded={open}
      onClick={onClick}
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
    >
      <Bell aria-hidden="true" className="h-5 w-5" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-paper bg-danger px-1 font-mono text-[10px] font-black leading-none text-paper"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}

export function NotificationCard({
  summary,
  onClose,
}: {
  summary: NotificationSummary;
  onClose: () => void;
}) {
  const hasReminders = summary.overdue > 0 || summary.dueSoon > 0;

  return (
    <section className="absolute right-4 top-14 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-paper shadow-lift md:right-8 lg:right-8">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 className="font-body text-sm font-bold text-ink">Notifications</h2>
          <p className="font-body text-xs text-slate">Due date reminders</p>
        </div>
        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div className="grid gap-2 p-3">
        {summary.loading ? (
          <NotificationItem
            icon={<Clock3 aria-hidden="true" className="h-4 w-4" />}
            title="Loading reminders"
            message="Open board data is being checked."
            tone="slate"
          />
        ) : summary.error ? (
          <NotificationItem
            icon={<AlertCircle aria-hidden="true" className="h-4 w-4" />}
            title="Reminders unavailable"
            message="Refresh the board and try again."
            tone="danger"
          />
        ) : hasReminders ? (
          <>
            {summary.overdue > 0 ? (
              <NotificationItem
                icon={<AlertCircle aria-hidden="true" className="h-4 w-4" />}
                title="Overdue attention needed"
                message={`${summary.overdue} ${
                  summary.overdue === 1 ? "task is" : "tasks are"
                } overdue`}
                tone="danger"
              />
            ) : null}
            {summary.dueSoon > 0 ? (
              <NotificationItem
                icon={<Clock3 aria-hidden="true" className="h-4 w-4" />}
                title="Upcoming deadline"
                message={`${summary.dueSoon} ${
                  summary.dueSoon === 1 ? "task is" : "tasks are"
                } due within 24h`}
                tone="amber"
              />
            ) : null}
          </>
        ) : (
          <NotificationItem
            icon={<CheckCircle2 aria-hidden="true" className="h-4 w-4" />}
            title="All clear"
            message="No upcoming reminders right now."
            tone="done"
          />
        )}
      </div>
    </section>
  );
}

const ITEM_TONES = {
  slate: "bg-ink/[0.035] text-slate",
  amber: "bg-amber/10 text-amber",
  danger: "bg-danger/10 text-danger",
  done: "bg-done/10 text-done",
} as const;

function NotificationItem({
  icon,
  title,
  message,
  tone,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  tone: keyof typeof ITEM_TONES;
}) {
  return (
    <article className="flex gap-3 rounded-xl border border-line bg-paper p-3">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          ITEM_TONES[tone],
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-body text-sm font-bold text-ink">{title}</h3>
        <p className="mt-0.5 font-body text-xs leading-5 text-slate">
          {message}
        </p>
      </div>
    </article>
  );
}
