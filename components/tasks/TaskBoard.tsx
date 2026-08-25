"use client";

import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";

export interface TaskBoardProps {
  tasks?: Task[];
  onNewTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
}

export function TaskBoard({
  tasks = [],
  onNewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks
          .filter((task) => task.status === status)
          .sort((a, b) => a.position - b.position);

        return (
          <TaskColumn
            key={status}
            status={status}
            count={columnTasks.length}
            onNewTask={onNewTask}
          >
            {columnTasks.map((task) => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  onEdit={() => onEditTask?.(task)}
                  onDelete={() => onDeleteTask?.(task)}
                  onStatusChange={(nextStatus) =>
                    onStatusChange?.(task, nextStatus)
                  }
                />
              </li>
            ))}
          </TaskColumn>
        );
      })}
    </div>
  );
}
