"use client";

import { toast } from "sonner";

import { useDeleteTask } from "@/hooks/useTasks";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Task } from "@/lib/types";

export interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  task,
}: DeleteConfirmDialogProps) {
  const deleteTask = useDeleteTask();

  async function onConfirm() {
    if (!task) return;
    try {
      await deleteTask.mutateAsync(task);
      toast.success("Task deleted");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Task was not deleted.",
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete task?"
      description="This can't be undone."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleteTask.isPending}>
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleteTask.isPending || !task}
          >
            {deleteTask.isPending ? "Deleting..." : "Delete task"}
          </Button>
        </>
      }
    >
      {task ? (
        <p className="font-body text-sm text-slate">{task.title}</p>
      ) : null}
    </Modal>
  );
}
