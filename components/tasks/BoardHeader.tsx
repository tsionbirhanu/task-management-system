"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AlertCircle, CheckCircle2, Clock3, Plus, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { getReminderTasks } from "@/lib/reminders";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface BoardHeaderProps {
  /** Signed-in address, or null in preview mode. */
  email: string | null;
  /** The tickets currently on screen -- see the note on the stat row below. */
  tasks: Task[];
  onNewTask: () => void;
}

const GREETING_REFRESH_MS = 60_000;

/**
 * Greeting, and a summary of the board.
 *
 * The stat row deliberately describes the *visible* board rather than
 * everything you own: with a filter applied it reports the filtered set, so its
 * numbers always add up against what is on screen. Global counts -- the ones
 * that must not be hidden by a filter -- belong to the notification bell, which
 * reads them from its own unfiltered query.
 */
export function BoardHeader({ email, tasks, onNewTask }: BoardHeaderProps) {
  const [greeting, setGreeting] = useState(getTimeGreeting);
  const displayName = useMemo(() => getDisplayName(email), [email]);

  const stats = useMemo(() => {
    const { overdue } = getReminderTasks(tasks);
    const countBy = (status: Task["status"]) =>
      tasks.filter((task) => task.status === status).length;

    return {
      total: tasks.length,
      todo: countBy("todo"),
      inProgress: countBy("in_progress"),
      done: countBy("done"),
      overdue: overdue.length,
    };
  }, [tasks]);

  // The greeting is wrong the moment the clock crosses noon or 5pm, and a board
  // left open all day is the normal case here.
  useEffect(() => {
    const interval = window.setInterval(
      () => setGreeting(getTimeGreeting()),
      GREETING_REFRESH_MS,
    );
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {greeting}, {displayName}!
          </h1>
          <p className="mt-1 font-body text-sm font-medium text-slate">
            Here&apos;s what needs your attention today.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onNewTask}
          className="h-11 w-full self-start rounded-xl px-5 sm:w-auto sm:self-auto"
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
          tone="progress"
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
  );
}

type StatTone = "progress" | "amber" | "danger" | "done";

const STAT_ICON: Record<StatTone, string> = {
  progress: "bg-progress/10 text-progress",
  amber: "bg-amber/15 text-amber",
  danger: "bg-danger/10 text-danger",
  done: "bg-done/12 text-done",
};

function StatPill({
  icon,
  label,
  value,
  subtext,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  subtext: string;
  tone: StatTone;
}) {
  return (
    <div className="flex min-h-28 items-center gap-4 rounded-2xl border border-line bg-paper p-5 shadow-ticket">
      <span
        className={cn(
          "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
          STAT_ICON[tone],
        )}
      >
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

function percent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

/** "sam.rivera@work.com" -> "Sam". Falls back to a neutral "there". */
function getDisplayName(email: string | null): string {
  if (!email) return "there";

  const localPart = email.split("@")[0] ?? "";
  const firstPart = localPart.split(/[._-]+/).filter(Boolean)[0];
  if (!firstPart) return "there";

  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
}
