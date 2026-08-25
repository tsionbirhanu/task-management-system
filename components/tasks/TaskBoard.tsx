"use client";

import { TaskColumn } from "@/components/tasks/TaskColumn";
import { TASK_STATUSES, type Task } from "@/lib/types";

export interface TaskBoardProps {
  tasks?: Task[];
}

/**
 * Scaffold: renders the three-column rail from a plain task list.
 * Next phase wires dnd-kit (DndContext + SortableContext per column) and the
 * useTasks query around this same layout.
 */
export function TaskBoard({ tasks = [] }: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <TaskColumn
            key={status}
            status={status}
            count={columnTasks.length}
          />
        );
      })}
    </div>
  );
}
