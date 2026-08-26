import type { ReactNode } from "react";

import { ClipboardList } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/Button";

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: ButtonProps["onClick"];
  };
}

export function EmptyState({
  icon = <ClipboardList aria-hidden="true" className="h-4 w-4" />,
  title = "No tasks here yet",
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-line bg-paper/75 px-5 py-10 text-center shadow-ticket">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-progress/20 bg-progress/10 text-progress">
        {icon}
      </div>
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm font-body text-sm leading-6 text-slate">{message}</p>
      {action ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
