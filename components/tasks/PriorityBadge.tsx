import { PRIORITY_META, type TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLORS: Record<TaskPriority, string> = {
  high: "bg-danger/10 text-danger",
  medium: "bg-amber/12 text-amber",
  low: "bg-done/10 text-done",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-body text-xs font-bold leading-none",
        COLORS[priority],
      )}
    >
      <span className="sr-only">Priority: </span>
      {PRIORITY_META[priority].label}
    </span>
  );
}
