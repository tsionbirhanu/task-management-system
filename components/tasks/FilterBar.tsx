"use client";

import { LayoutGrid, List } from "lucide-react";

import { SearchInput } from "@/components/tasks/SearchInput";
import { Select } from "@/components/ui/Select";
import {
  PRIORITY_META,
  STATUS_META,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskFilters,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type BoardView = "board" | "list";

export interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  view: BoardView;
  onViewChange: (view: BoardView) => void;
}

export function FilterBar({
  filters,
  onFiltersChange,
  view,
  onViewChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:max-w-xl sm:flex-row">
        <SearchInput
          className="flex-1"
          value={filters.q ?? ""}
          onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })}
        />
        <div className="flex gap-2">
          <Select
            label="Filter by status"
            srOnlyLabel
            className="h-9 w-full sm:w-36"
            value={filters.status ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: (event.target.value ||
                  undefined) as TaskFilters["status"],
              })
            }
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </Select>
          <Select
            label="Filter by priority"
            srOnlyLabel
            className="h-9 w-full sm:w-36"
            value={filters.priority ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                priority: (event.target.value ||
                  undefined) as TaskFilters["priority"],
              })
            }
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_META[priority].label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div
        role="group"
        aria-label="View"
        className="inline-flex shrink-0 rounded-md border border-line p-0.5"
      >
        <ViewToggle
          active={view === "board"}
          onClick={() => onViewChange("board")}
          label="Board"
          icon={<LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" />}
        />
        <ViewToggle
          active={view === "list"}
          onClick={() => onViewChange("list")}
          label="List"
          icon={<List aria-hidden="true" className="h-3.5 w-3.5" />}
        />
      </div>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5",
        "font-body text-xs font-medium transition-colors duration-150 ease-out",
        active ? "bg-ink text-paper" : "text-slate hover:bg-ink/[0.04]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
