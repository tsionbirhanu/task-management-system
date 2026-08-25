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
  neutral: "border-line bg-ink/[0.03] text-slate",
  amber: "border-amber/30 bg-amber/10 text-ink",
  done: "border-done/30 bg-done/10 text-done",
  danger: "border-danger/30 bg-danger/10 text-danger",
  progress: "border-progress/30 bg-progress/10 text-progress",
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
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5",
        "text-[11px] font-medium leading-none",
        mono ? "font-mono" : "font-body",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
