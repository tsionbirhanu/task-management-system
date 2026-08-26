"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, Settings, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export interface UserMenuProps {
  /** Signed-in address, or null in preview mode. */
  email: string | null;
}

export function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(email);

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
      <span className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-line bg-paper px-2.5 font-body text-xs font-semibold text-slate">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-progress/10 text-progress">
          <UserRound aria-hidden="true" className="h-4 w-4" />
        </span>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
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
          "inline-flex h-11 items-center gap-2 rounded-xl border bg-paper px-1.5 pr-2",
          "font-body text-xs font-semibold text-slate transition-colors duration-150 ease-out",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
          open ? "border-slate/40 text-ink" : "border-line hover:border-slate/40 hover:text-ink",
        )}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-progress font-mono text-xs font-bold text-paper ring-2 ring-paper">
          {initials}
        </span>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-paper shadow-lift"
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-progress font-mono text-sm font-bold text-paper">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-body text-sm font-bold text-ink">My Profile</p>
              <p className="truncate font-mono text-[11px] font-semibold text-slate">
                {email}
              </p>
            </div>
          </div>
          <MenuButton
            icon={<UserRound aria-hidden="true" className="h-3.5 w-3.5" />}
            onClick={() => toast.info("Profile settings are not built yet.")}
          >
            My Profile
          </MenuButton>
          <MenuButton
            icon={<Settings aria-hidden="true" className="h-3.5 w-3.5" />}
            onClick={() => toast.info("Account settings are not built yet.")}
          >
            Account Settings
          </MenuButton>
          <MenuButton
            icon={<UsersRound aria-hidden="true" className="h-3.5 w-3.5" />}
            onClick={() => toast.info("Team members are not built yet.")}
          >
            Team Members
          </MenuButton>
          {/* A real form post, so signing out works without JavaScript. */}
          <form method="post" action="/api/auth/signout">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-left font-body text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
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

function MenuButton({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-body text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
    >
      <span className="text-slate">{icon}</span>
      {children}
    </button>
  );
}

function getInitials(email: string | null): string {
  if (!email) return "U";
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "U";
}
