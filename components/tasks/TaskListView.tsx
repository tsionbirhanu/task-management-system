"use client";

import { DueBadge } from "@/components/tasks/DueBadge";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_META, formatTicketNumber, type Task } from "@/lib/types";

export interface TaskListViewProps {
  tasks?: Task[];
}

/**
 * The dense alternative to the board, for people who would rather scan than
 * drag. Same data, one row per ticket, IDs and dates in mono.
 */
export function TaskListView({ tasks = [] }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No matching tasks"
        message="No tickets match these filters. Clear the search or open a new work order."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-paper/60">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <caption className="sr-only">All tickets</caption>
        <thead>
          <tr className="border-b border-line">
            <Th className="w-28">Ticket</Th>
            <Th>Title</Th>
            <Th className="w-32">Status</Th>
            <Th className="w-28">Priority</Th>
            <Th className="w-40">Due</Th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-line/70 last:border-b-0 hover:bg-ink/[0.02]"
            >
              <td className="px-3 py-2.5 font-mono text-xs text-slate">
                {formatTicketNumber(task.ticket_no)}
              </td>
              <td className="px-3 py-2.5 font-body text-sm text-ink">
                {task.title}
              </td>
              <td className="px-3 py-2.5 font-body text-sm text-slate">
                {STATUS_META[task.status].label}
              </td>
              <td className="px-3 py-2.5">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-3 py-2.5">
                <DueBadge dueDate={task.due_date} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-3 py-2 font-display text-[11px] font-semibold uppercase tracking-wide text-slate ${className ?? ""}`}
    >
      {children}
    </th>
  );
}
