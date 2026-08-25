"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shown under the field, in danger, and wired up via aria-describedby. */
  error?: string;
  hint?: string;
  /** Use the mono face -- for dates, IDs, and other tabular values. */
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, mono = false, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="font-body text-xs font-medium text-slate"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          "h-10 w-full rounded-md border bg-paper px-3 text-sm text-ink",
          "placeholder:text-slate/60",
          "transition-colors duration-150 ease-out",
          "focus-visible:border-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
          mono ? "font-mono" : "font-body",
          error ? "border-danger" : "border-line hover:border-slate/40",
          className,
        )}
        {...props}
      />
      {error || hint ? (
        <p
          id={messageId}
          className={cn(
            "font-body text-xs",
            error ? "text-danger" : "text-slate",
          )}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
});
