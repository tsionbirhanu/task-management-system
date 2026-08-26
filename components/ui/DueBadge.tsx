import { AlertTriangle } from "lucide-react";
import { differenceInCalendarDays, isPast, startOfToday } from "date-fns";

import { Badge } from "@/components/ui/Badge";

export interface DueBadgeProps {
  /** ISO 8601 timestamp, or null for a ticket with no deadline. */
  dueDate: string | null;
}

export function DueBadge({ dueDate }: DueBadgeProps) {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  if (isPast(due)) {
    const days = Math.max(1, Math.abs(differenceInCalendarDays(due, startOfToday())));

    return (
      <Badge color="danger" className="animate-pulse">
        <AlertTriangle aria-hidden="true" className="h-3 w-3" />
        {`${days}d overdue`}
      </Badge>
    );
  }

  const days = differenceInCalendarDays(due, startOfToday());

  return (
    <Badge color={days === 0 ? "amber" : "slate"}>
      {days === 0 ? "Due today" : `Due in ${days}d`}
    </Badge>
  );
}
