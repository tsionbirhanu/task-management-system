import { format, formatDistanceToNowStrict, isPast } from "date-fns";

import { Badge, type BadgeTone } from "@/components/ui/Badge";

const HOURS_CONSIDERED_SOON = 48;

export interface DueBadgeProps {
  /** ISO 8601 timestamp, or null for a ticket with no deadline. */
  dueDate: string | null;
}

/**
 * Reads the deadline three ways at once: the date, how long is left, and -- via
 * color -- whether that is a problem yet.
 */
export function DueBadge({ dueDate }: DueBadgeProps) {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const overdue = isPast(due);
  const hoursLeft = (due.getTime() - Date.now()) / 3_600_000;
  const soon = !overdue && hoursLeft <= HOURS_CONSIDERED_SOON;

  const tone: BadgeTone = overdue ? "danger" : soon ? "amber" : "neutral";
  const distance = formatDistanceToNowStrict(due);

  return (
    <Badge tone={tone}>
      <span className="sr-only">{overdue ? "Overdue by" : "Due in"} </span>
      <time dateTime={due.toISOString()}>{format(due, "dd MMM")}</time>
      <span aria-hidden="true" className="opacity-40">
        /
      </span>
      <span>{overdue ? `${distance} late` : distance}</span>
    </Badge>
  );
}
