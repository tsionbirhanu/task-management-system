"use client";

import { LayoutGrid, List, X } from "lucide-react";

import { SearchInput } from "@/components/tasks/SearchInput";
import { Select } from "@/components/ui/Select";
import {
  PRIORITY_META,
  STATUS_META,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type BoardView,
  type TaskFilters,
  type TaskSort,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  sort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  view: BoardView;
  onViewChange: (view: BoardView) => void;
}

export function FilterBar({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: FilterBarProps) {
  const search = filters.search ?? "";
  const activeFilters = [
    search
      ? {
          key: "search",
          label: `"${search}"`,
          onRemove: () => onFiltersChange({ ...filters, search: undefined }),
        }
      : null,
    filters.status
      ? {
          key: "status",
          label: STATUS_META[filters.status].label,
          onRemove: () => onFiltersChange({ ...filters, status: undefined }),
        }
      : null,
    filters.priority
      ? {
          key: "priority",
          label: PRIORITY_META[filters.priority].label,
          onRemove: () => onFiltersChange({ ...filters, priority: undefined }),
        }
      : null,
  ].filter((item): item is ActiveFilter => item !== null);

  function clearAll() {
    onFiltersChange({
      ...filters,
      search: undefined,
      status: undefined,
      priority: undefined,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-2 lg:flex-row">
          <SearchInput
            className="min-w-0 flex-1"
            value={search}
            onChange={(nextSearch) =>
              onFiltersChange({ ...filters, search: nextSearch || undefined })
            }
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-[34rem]">
            <Select
              label="Filter by status"
              srOnlyLabel
              className="h-10 rounded-xl bg-ink/[0.025] shadow-none"
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
              className="h-10 rounded-xl bg-ink/[0.025] shadow-none"
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
            <Select
              label="Sort tasks"
              srOnlyLabel
              className="h-10 rounded-xl bg-ink/[0.025] shadow-none"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as TaskSort)}
            >
              <option value="created_at">Newest</option>
              <option value="due_date">Due soonest</option>
              <option value="priority">Priority</option>
            </Select>
          </div>
        </div>

        <ViewToggleGroup view={view} onViewChange={onViewChange} />
      </div>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-line/80 pt-3">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.onRemove}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-[11px] font-semibold text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none"
            >
              {filter.label}
              <X aria-hidden="true" className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full px-3 py-1.5 font-body text-xs font-semibold text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ViewToggleGroup({
  view,
  onViewChange,
}: {
  view: BoardView;
  onViewChange: (view: BoardView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="View"
      className="inline-flex w-full shrink-0 rounded-xl border border-line bg-ink/[0.025] p-1 sm:w-auto xl:self-auto"
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
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:flex-none",
        "font-body text-xs font-semibold transition-colors duration-150 ease-out",
        "focus-visible:outline-none",
        active ? "bg-progress text-paper shadow-ticket" : "text-slate hover:bg-paper hover:text-ink",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
