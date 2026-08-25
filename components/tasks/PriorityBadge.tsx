import { Badge, type BadgeColor } from "@/components/ui/Badge";
import { PRIORITY_META, type TaskPriority } from "@/lib/types";

const COLORS: Record<TaskPriority, BadgeColor> = {
  high: "danger",
  medium: "amber",
  low: "slate",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge color={COLORS[priority]}>
      <span className="sr-only">Priority: </span>
      {PRIORITY_META[priority].label}
    </Badge>
  );
}
