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
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-line px-4 py-8 text-center">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-line bg-paper text-slate">
        {icon}
      </div>
      <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm font-body text-sm text-slate">{message}</p>
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
