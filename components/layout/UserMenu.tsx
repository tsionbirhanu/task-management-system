"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

export interface UserMenuProps {
  /** Signed-in address, or null in preview mode. */
  email: string | null;
}

export function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!email) {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line px-2.5 py-1.5 font-body text-xs text-slate">
        <UserRound aria-hidden="true" className="h-3.5 w-3.5" />
        Account
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5",
          "font-body text-xs text-slate transition-colors duration-150 ease-out",
          open ? "border-slate/40 text-ink" : "border-line hover:border-slate/40 hover:text-ink",
        )}
      >
        <UserRound aria-hidden="true" className="h-3.5 w-3.5" />
        <span className="max-w-[10rem] truncate">{email}</span>
        <ChevronDown aria-hidden="true" className="h-3 w-3" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-60 overflow-hidden rounded-md border border-line bg-paper shadow-lift"
        >
          <p className="truncate border-b border-line px-3 py-2 font-mono text-[11px] text-slate">
            {email}
          </p>
          {/* A real form post, so signing out works without JavaScript. */}
          <form method="post" action="/api/auth/signout">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left font-body text-sm text-ink transition-colors duration-150 ease-out hover:bg-ink/[0.04]"
            >
              <LogOut aria-hidden="true" className="h-3.5 w-3.5 text-slate" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
