"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Required: the button shows an icon, so this is its only accessible name. */
  label: string;
  /** Red treatment for destructive actions. */
  danger?: boolean;
  children: ReactNode;
}

/**
 * A square icon-only button.
 *
 * `label` is not optional on purpose -- an icon with no text has no accessible
 * name unless someone supplies one, and making it required means it cannot be
 * forgotten. It feeds both aria-label and the hover tooltip.
 */
export function IconButton({
  label,
  danger = false,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent",
        "transition-colors duration-150 ease-out",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        danger
          ? "text-danger hover:border-danger/30 hover:bg-danger/10"
          : "text-slate hover:border-line hover:bg-ink/[0.04] hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
