"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toasts are ink surfaces on the warm paper page -- the same inversion the top
 * bar uses -- with amber reserved for the action button.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      gap={8}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "!bg-ink !border !border-ink !text-paper !rounded-md !shadow-lift !font-body",
          title: "!font-body !text-sm !font-medium !text-paper",
          description: "!font-body !text-xs !text-paper/70",
          actionButton: "!bg-amber !text-ink !font-body !text-xs !font-medium",
          cancelButton: "!bg-paper/10 !text-paper !font-body !text-xs",
          closeButton: "!bg-ink !border-paper/20 !text-paper",
          success: "!border-l-4 !border-l-done",
          error: "!border-l-4 !border-l-danger",
          warning: "!border-l-4 !border-l-amber",
          info: "!border-l-4 !border-l-progress",
        },
      }}
    />
  );
}
