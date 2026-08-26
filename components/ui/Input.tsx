"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shown under the field, in danger, and wired up via aria-describedby. */
  error?: string;
  hint?: string;
  /** Use the mono face -- for dates, IDs, and other tabular values. */
  mono?: boolean;
  /**
   * Control pinned inside the field's right edge -- the password eye, and
   * anything else that belongs to the input rather than beside it. The field
   * reserves padding for it so long values never run underneath.
   */
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, mono = false, trailing, id, ...props },
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
      <div className="relative flex w-full items-center">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-paper px-3 text-sm text-ink shadow-ticket",
            "placeholder:text-slate/60",
            "transition-colors duration-150 ease-out",
            "focus-visible:border-line focus-visible:outline-none",
            mono ? "font-mono" : "font-body",
            error ? "border-danger" : "border-line hover:border-slate/40",
            trailing ? "pr-11" : undefined,
            className,
          )}
          {...props}
        />
        {trailing ? (
          <span className="absolute right-1 flex items-center">{trailing}</span>
        ) : null}
      </div>
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
