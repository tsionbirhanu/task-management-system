"use client";

import { useMemo, useState, type ReactNode } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  compareAsc,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { parseDueDate } from "@/lib/reminders";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface BoardCalendarProps {
  tasks: Task[];
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

interface DatedTask {
  task: Task;
  due: Date;
}

/** Month grid marking days that carry deadlines, with the selected day listed. */
export function BoardCalendar({ tasks }: BoardCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 }),
    });
  }, [month]);

  const dueTasks = useMemo(
    () =>
      tasks
        .map((task) => ({ task, due: parseDueDate(task.due_date) }))
        .filter((entry): entry is DatedTask => entry.due !== null),
    [tasks],
  );

  const selectedTasks = useMemo(
    () =>
      dueTasks
        .filter(({ due }) => isSameDay(due, selectedDate))
        .sort((a, b) => compareAsc(a.due, b.due)),
    [dueTasks, selectedDate],
  );

  function shiftMonth(delta: number) {
    setMonth((current) =>
      startOfMonth(
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
      ),
    );
  }

  function selectDay(day: Date) {
    setSelectedDate(day);
    // Following a trailing day into its own month, so the selection never sits
    // outside the grid being shown.
    if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
  }

  return (
    <section className="rounded-2xl border border-line bg-paper p-4 shadow-ticket">
      <header className="flex items-center justify-between">
        <h2 className="font-body text-sm font-bold text-ink">Calendar</h2>
        <div className="flex items-center gap-1">
          <MonthButton label="Previous month" onClick={() => shiftMonth(-1)}>
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </MonthButton>
          <MonthButton label="Next month" onClick={() => shiftMonth(1)}>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </MonthButton>
        </div>
      </header>

      <p className="mt-4 text-center font-body text-sm font-bold text-ink">
        {format(month, "MMMM yyyy")}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            className="font-body text-[11px] font-bold text-slate"
          >
            {weekday}
          </span>
        ))}
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            day={day}
            inMonth={isSameMonth(day, month)}
            isToday={isSameDay(day, new Date())}
            isSelected={isSameDay(day, selectedDate)}
            hasDueTask={dueTasks.some(({ due }) => isSameDay(due, day))}
            onSelect={() => selectDay(day)}
          />
        ))}
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="font-body text-xs font-bold uppercase tracking-wide text-slate">
          {format(selectedDate, "MMM d")}
        </p>
        {selectedTasks.length === 0 ? (
          <p className="mt-2 rounded-xl bg-ink/[0.025] px-3 py-3 font-body text-sm text-slate">
            No tasks due this day.
          </p>
        ) : (
          <div className="mt-2 grid gap-2">
            {selectedTasks.map(({ task, due }) => (
              <article
                key={task.id}
                className="rounded-xl border border-line/80 bg-ink/[0.018] px-3 py-2"
              >
                <h3 className="line-clamp-1 font-body text-sm font-bold text-ink">
                  {task.title}
                </h3>
                <p className="mt-1 font-body text-xs font-semibold text-slate">
                  {format(due, "h:mm a")}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CalendarDay({
  day,
  inMonth,
  isToday,
  isSelected,
  hasDueTask,
  onSelect,
}: {
  day: Date;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasDueTask: boolean;
  onSelect: () => void;
}) {
  const dueSuffix = hasDueTask ? ", has due tasks" : "";

  return (
    <button
      type="button"
      aria-label={format(day, "MMMM d, yyyy") + dueSuffix}
      aria-pressed={isSelected}
      onClick={onSelect}
      className={cn(
        "relative grid h-8 place-items-center rounded-full font-mono text-xs font-semibold",
        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60",
        isSelected && "bg-ink text-paper",
        !isSelected && isToday && "bg-progress text-paper",
        !isSelected &&
          !isToday &&
          (inMonth
            ? "text-ink hover:bg-ink/[0.04]"
            : "text-slate/45 hover:bg-ink/[0.03]"),
      )}
    >
      {format(day, "d")}
      {hasDueTask ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-1 h-1 w-1 rounded-full",
            isSelected || isToday ? "bg-paper" : "bg-progress",
          )}
        />
      ) : null}
    </button>
  );
}

function MonthButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60"
    >
      {children}
    </button>
  );
}
