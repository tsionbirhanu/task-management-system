import { AlertTriangle } from "lucide-react";
import { differenceInCalendarDays, startOfToday } from "date-fns";

import { Badge } from "@/components/ui/Badge";
import { parseDueDate } from "@/lib/reminders";

export interface DueBadgeProps {
  /** ISO 8601 timestamp, or null for a ticket with no deadline. */
  dueDate: string | null;
}

/**
 * The deadline as a chip: "3d overdue", "Due today", "Due in 5d".
 *
 * Counted in calendar days rather than elapsed hours, because "due tomorrow" is
 * what a person means by tomorrow's date, not 24 hours from now.
 */
export function DueBadge({ dueDate }: DueBadgeProps) {
  const due = parseDueDate(dueDate);
  if (!due) return null;

  const days = differenceInCalendarDays(due, startOfToday());

  if (due.getTime() < Date.now()) {
    return (
      <Badge tone="danger" className="animate-pulse">
        <AlertTriangle aria-hidden="true" className="h-3 w-3" />
        {`${Math.max(1, Math.abs(days))}d overdue`}
      </Badge>
    );
  }

  return (
    <Badge tone={days === 0 ? "amber" : "neutral"}>
      {days === 0 ? "Due today" : `Due in ${days}d`}
    </Badge>
  );
}
