import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { PRIORITY_META, type TaskPriority } from "@/lib/types";

const TONES: Record<TaskPriority, BadgeTone> = {
  high: "danger",
  medium: "amber",
  low: "neutral",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge tone={TONES[priority]}>
      <span className="sr-only">Priority: </span>
      {PRIORITY_META[priority].label}
    </Badge>
  );
}
