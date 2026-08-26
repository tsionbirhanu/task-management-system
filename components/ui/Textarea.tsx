"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, error, hint, id, ...props }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const messageId = `${textareaId}-message`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={textareaId}
            className="font-body text-xs font-medium text-slate"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            "min-h-24 w-full rounded-lg border bg-paper px-3 py-2 text-sm text-ink shadow-ticket",
            "font-body placeholder:text-slate/60 transition-colors duration-150 ease-out",
            "focus-visible:border-line focus-visible:outline-none",
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
  },
);
