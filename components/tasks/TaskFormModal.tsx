"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  useCreateTask,
  useUpdateTask,
} from "@/hooks/useTasks";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
} from "@/lib/validation/task";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  PRIORITY_META,
  STATUS_META,
  TASK_PRIORITIES,
  TASK_STATUSES,
  formatTicketNumber,
  type Task,
} from "@/lib/types";

type TaskFormValues = {
  title: string;
  description?: string | null;
  status: CreateTaskInput["status"];
  priority: CreateTaskInput["priority"];
  due_date?: string | null;
};

export interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

function toLocalDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function valuesForTask(task?: Task | null): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
    priority: task?.priority ?? "medium",
    due_date: toLocalDateTime(task?.due_date ?? null),
  };
}

function normalize(values: TaskFormValues): CreateTaskInput {
  return {
    title: values.title,
    description: values.description?.trim() || null,
    status: values.status,
    priority: values.priority,
    due_date: values.due_date
      ? new Date(values.due_date).toISOString()
      : null,
  };
}

export function TaskFormModal({ open, onClose, task }: TaskFormModalProps) {
  const editing = Boolean(task);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const schema = editing ? updateTaskSchema : createTaskSchema;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<TaskFormValues>,
    defaultValues: valuesForTask(task),
  });

  useEffect(() => {
    if (open) reset(valuesForTask(task));
  }, [open, reset, task]);

  async function onSubmit(values: TaskFormValues) {
    try {
      const input = normalize(values);

      if (task) {
        await updateTask.mutateAsync({ id: task.id, input });
        toast.success("Ticket updated");
      } else {
        const created = await createTask.mutateAsync(input);
        toast.success(`${formatTicketNumber(created.ticket_no)} created`);
      }

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ticket was not saved.",
      );
    }
  }

  const busy = isSubmitting || createTask.isPending || updateTask.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${formatTicketNumber(task!.ticket_no)}` : "New ticket"}
      description={
        editing
          ? "Update the work order and save your changes."
          : "Give the work order a title, then set where it sits and when it is due."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" variant="primary" disabled={busy}>
            {busy ? "Saving..." : editing ? "Save changes" : "Create ticket"}
          </Button>
        </>
      }
    >
      <form
        id="task-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          label="Title"
          placeholder="Replace the belt on line 3"
          error={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          label="Description"
          rows={4}
          placeholder="What needs doing, and anything the next person should know."
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Status" error={errors.status?.message} {...register("status")}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </Select>
          <Select
            label="Priority"
            error={errors.priority?.message}
            {...register("priority")}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_META[priority].label}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Due date"
          type="datetime-local"
          mono
          error={errors.due_date?.message}
          {...register("due_date")}
        />
      </form>
    </Modal>
  );
}
