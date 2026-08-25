"use client";

import { toast } from "sonner";

import { useDeleteTask } from "@/hooks/useTasks";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatTicketNumber, type Task } from "@/lib/types";

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
  const ticket = task ? formatTicketNumber(task.ticket_no) : "this ticket";

  async function onConfirm() {
    if (!task) return;
    try {
      await deleteTask.mutateAsync(task);
      toast.success("Ticket deleted");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ticket was not deleted.",
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Delete ticket ${ticket}?`}
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
            {deleteTask.isPending ? "Deleting..." : "Delete ticket"}
          </Button>
        </>
      }
    >
      {task ? (
        <p className="font-body text-sm text-slate">
          <span className="font-mono text-xs text-ink">{ticket}</span>
          <span> - {task.title}</span>
        </p>
      ) : null}
    </Modal>
  );
}
