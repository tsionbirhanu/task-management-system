"use client";

import { useMemo, useState } from "react";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import {
  STATUS_META,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TaskBoardProps {
  tasks?: Task[];
  onNewTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus, position?: number) => void;
}

type Columns = Record<TaskStatus, Task[]>;

const POSITION_GAP = 1024;

export function TaskBoard({
  tasks = [],
  onNewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TaskBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const [mobileStatus, setMobileStatus] = useState<TaskStatus>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = useMemo(() => groupTasks(tasks), [tasks]);
  const taskById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
    const task = taskById.get(String(event.active.id));
    setOverStatus(task?.status ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverStatus(resolveOverStatus(event.over?.id, taskById));
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeTask = taskById.get(String(event.active.id));
    const targetStatus = resolveOverStatus(event.over?.id, taskById);

    setActiveId(null);
    setOverStatus(null);

    if (!activeTask || !targetStatus) return;
    if (event.over?.id === event.active.id && activeTask.status === targetStatus) {
      return;
    }

    const destination = columns[targetStatus].filter(
      (task) => task.id !== activeTask.id,
    );
    const overTask = event.over ? taskById.get(String(event.over.id)) : null;
    const overIndex =
      overTask && overTask.status === targetStatus
        ? destination.findIndex((task) => task.id === overTask.id)
        : destination.length;
    const insertIndex = overIndex >= 0 ? overIndex : destination.length;
    const position = positionForInsert(destination, insertIndex);

    if (
      activeTask.status === targetStatus &&
      activeTask.position === position
    ) {
      return;
    }

    onStatusChange?.(activeTask, targetStatus, position);
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverStatus(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        role="tablist"
        aria-label="Board columns"
        className="mb-3 grid grid-cols-3 gap-1 rounded-md border border-line bg-paper p-1 sm:hidden"
      >
        {TASK_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={mobileStatus === status}
            aria-controls={`column-panel-${status}`}
            onClick={() => setMobileStatus(status)}
            className={cn(
              "rounded px-2 py-2 font-body text-xs font-medium transition-colors duration-150",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
              mobileStatus === status
                ? "bg-ink text-paper"
                : "text-slate hover:bg-ink/[0.04] hover:text-ink",
            )}
          >
            {STATUS_META[status].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const columnTasks = columns[status];

          return (
            <TaskColumn
              key={status}
              status={status}
              count={columnTasks.length}
              isOver={overStatus === status}
              onNewTask={onNewTask}
              className={cn(status !== mobileStatus && "hidden sm:flex")}
            >
              <SortableContext
                items={columnTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    isActive={activeId === task.id}
                    onEdit={() => onEditTask?.(task)}
                    onDelete={() => onDeleteTask?.(task)}
                  />
                ))}
              </SortableContext>
            </TaskColumn>
          );
        })}
      </div>
    </DndContext>
  );
}

function SortableTask({
  task,
  isActive,
  onEdit,
  onDelete,
}: {
  task: Task;
  isActive: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "opacity-40" : undefined}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isActive}
      />
    </li>
  );
}

function groupTasks(tasks: Task[]): Columns {
  return TASK_STATUSES.reduce((columns, status) => {
    columns[status] = tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
    return columns;
  }, {} as Columns);
}

function resolveOverStatus(
  overId: UniqueIdentifier | null | undefined,
  taskById: Map<string, Task>,
): TaskStatus | null {
  if (!overId) return null;
  const id = String(overId);
  if (isTaskStatus(id)) return id;
  return taskById.get(id)?.status ?? null;
}

function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.some((status) => status === value);
}

function positionForInsert(tasks: Task[], index: number): number {
  const before = tasks[index - 1]?.position;
  const after = tasks[index]?.position;

  if (before === undefined && after === undefined) return POSITION_GAP;
  if (before === undefined) {
    return after > 1 ? Math.floor(after / 2) : after - POSITION_GAP;
  }
  if (after === undefined) return before + POSITION_GAP;

  const gap = after - before;
  return gap > 1 ? before + Math.floor(gap / 2) : before + 1;
}
