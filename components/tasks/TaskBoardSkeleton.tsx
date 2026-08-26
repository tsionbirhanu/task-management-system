import { TASK_STATUSES, type BoardView } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskBoardSkeletonProps {
  view: BoardView;
}

/** Placeholder shaped like the real board, so the layout does not jump on load. */
export function TaskBoardSkeleton({ view }: TaskBoardSkeletonProps) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-2" aria-label="Loading tasks">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonTicket key={index} compact />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
      aria-label="Loading board"
    >
      {TASK_STATUSES.map((status) => (
        <section
          key={status}
          className="flex min-h-[28rem] flex-col rounded-[1.15rem] border border-line bg-paper/75 p-3 shadow-ticket"
        >
          <div className="mb-3 border-b-2 border-b-line pb-3">
            <div className="h-4 w-24 rounded bg-line/80" />
            <div className="mt-2 h-3 w-16 rounded bg-line/60" />
          </div>
          <div className="flex flex-col gap-2">
            <SkeletonTicket />
            <SkeletonTicket />
          </div>
        </section>
      ))}
    </div>
  );
}

function SkeletonTicket({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-line bg-paper shadow-ticket",
        compact ? "p-3" : "pl-4",
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-line"
      />
      <div className={compact ? undefined : "px-3 py-3"}>
        <div className="h-3 w-20 rounded bg-line/80" />
        <div className="mt-3 h-4 w-3/4 rounded bg-line/70" />
        <div className="mt-2 h-3 w-full rounded bg-line/50" />
        <div className="mt-2 h-3 w-2/3 rounded bg-line/50" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-16 rounded bg-line/60" />
          <div className="h-6 w-20 rounded bg-line/60" />
        </div>
      </div>
    </div>
  );
}
