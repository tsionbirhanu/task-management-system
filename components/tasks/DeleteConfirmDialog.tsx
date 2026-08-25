"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatTicketNumber, type Task } from "@/lib/types";

export interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  task?: Task;
  isDeleting?: boolean;
}

/** Scaffold: chrome only. The delete mutation lands with the API routes. */
export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  task,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  const ticket = task ? formatTicketNumber(task.ticket_no) : "this ticket";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Delete ${ticket}?`}
      description="This removes the work order for good. You cannot undo it."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Keep it
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete ticket"}
          </Button>
        </>
      }
    >
      {task ? (
        <p className="font-body text-sm text-slate">
          <span className="font-mono text-xs text-ink">{ticket}</span>
          <span> — {task.title}</span>
        </p>
      ) : null}
    </Modal>
  );
}
