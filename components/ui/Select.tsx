"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  /** Hide the label visually but keep it for screen readers. */
  srOnlyLabel?: boolean;
}

/**
 * A native <select>, on purpose. It is the keyboard and screen-reader fallback
 * for moving a ticket between columns without drag-and-drop.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, srOnlyLabel = false, id, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className={cn(
            "font-body text-xs font-medium text-slate",
            srOnlyLabel && "sr-only",
          )}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? messageId : undefined}
          className={cn(
            "h-10 w-full appearance-none rounded-md border bg-paper",
            "pl-3 pr-9 font-body text-sm text-ink",
            "transition-colors duration-150 ease-out",
            error ? "border-danger" : "border-line hover:border-slate/40",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
        />
      </div>
      {error ? (
        <p id={messageId} className="font-body text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
