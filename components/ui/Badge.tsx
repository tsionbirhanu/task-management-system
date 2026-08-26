import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "amber" | "done" | "danger" | "progress";

export interface BadgeProps {
  tone?: BadgeTone;
  /** Mono is the default: badges carry dates, priorities, and other metadata. */
  mono?: boolean;
  className?: string;
  children: ReactNode;
}

const TONES: Record<BadgeTone, string> = {
  neutral: "border-line bg-ink/[0.035] text-slate",
  amber: "border-amber/20 bg-amber/12 text-amber",
  done: "border-done/20 bg-done/10 text-done",
  danger: "border-danger/20 bg-danger/10 text-danger",
  progress: "border-progress/20 bg-progress/10 text-progress",
};

/** A small metadata chip. Quiet by design -- the ticket number is the loud part. */
export function Badge({
  tone = "neutral",
  mono = true,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1",
        "text-[11px] font-semibold leading-none",
        mono ? "font-mono" : "font-body",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
