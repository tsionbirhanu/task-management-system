"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  PRIORITY_META,
  STATUS_META,
  TASK_PRIORITIES,
  TASK_STATUSES,
  formatTicketNumber,
  type Task,
} from "@/lib/types";

export interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Present when editing; absent when opening a fresh work order. */
  task?: Task;
}

/**
 * Scaffold: field layout only. Next phase wires react-hook-form with
 * zodResolver(createTaskSchema) and the create/update mutations from useTasks.
 */
export function TaskFormModal({ open, onClose, task }: TaskFormModalProps) {
  const editing = Boolean(task);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${formatTicketNumber(task!.ticket_number)}` : "New ticket"}
      description={
        editing
          ? "Update the work order and save your changes."
          : "Give the work order a title, then set where it sits and when it is due."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled>
            {editing ? "Save changes" : "Create ticket"}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" noValidate>
        <Input
          label="Title"
          name="title"
          placeholder="Replace the belt on line 3"
          defaultValue={task?.title ?? ""}
        />

        <div className="flex w-full flex-col gap-1.5">
          <label
            htmlFor="task-description"
            className="font-body text-xs font-medium text-slate"
          >
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            rows={4}
            defaultValue={task?.description ?? ""}
            placeholder="What needs doing, and anything the next person should know."
            className="w-full rounded-md border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-slate/60 transition-colors duration-150 ease-out hover:border-slate/40"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Status" name="status" defaultValue={task?.status ?? "todo"}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </Select>
          <Select
            label="Priority"
            name="priority"
            defaultValue={task?.priority ?? "medium"}
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
          name="due_date"
          type="date"
          mono
          defaultValue={task?.due_date?.slice(0, 10) ?? ""}
        />
      </form>
    </Modal>
  );
}
