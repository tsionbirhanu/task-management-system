"use client";

import { useCallback, useEffect, useState } from "react";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  NotificationButton,
  NotificationCard,
  notificationCount,
  useNotificationSummary,
} from "@/components/layout/Notifications";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";

export interface TopBarProps {
  /** Signed-in address, or null in preview mode. */
  email?: string | null;
}

const SEARCH_DEBOUNCE_MS = 250;

export function TopBar({ email = null }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draft, setDraft] = useState(searchParams.get("search") ?? "");
  const [notificationOpen, setNotificationOpen] = useState(false);

  const summary = useNotificationSummary();
  const onBoard = pathname === "/board";

  // The URL is the source of truth, so a back/forward navigation -- or a filter
  // cleared elsewhere on the page -- has to pull this input back into line.
  useEffect(() => {
    setDraft(searchParams.get("search") ?? "");
  }, [searchParams]);

  /**
   * Ctrl/Cmd+K.
   *
   * The board's own search field is the single target. It is the one rendered
   * at every breakpoint -- this header's input is hidden below md -- and aiming
   * at both meant whichever focused last silently won.
   */
  const focusSearch = useCallback(() => {
    if (!onBoard) {
      router.push(boardHref(draft));
      return;
    }

    window.dispatchEvent(new CustomEvent("workbench:focus-search"));
  }, [draft, onBoard, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusSearch]);

  // Debounced write-back, so typing does not push one history entry per keystroke.
  useEffect(() => {
    if (!onBoard) return;

    const timeout = window.setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (draft === current) return;

      const params = new URLSearchParams(searchParams);
      if (draft.trim()) params.set("search", draft.trim());
      else params.delete("search");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [draft, onBoard, pathname, router, searchParams]);

  function onSearchChange(value: string) {
    setDraft(value);

    // Searching from another page is a request to go and see the results.
    if (!onBoard) router.push(boardHref(value));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href="/board"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          aria-label="Workbench home"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-progress text-paper shadow-ticket"
          >
            <span className="font-display text-sm font-black">W</span>
          </span>
          <span className="hidden font-display text-xl font-bold tracking-tight text-ink sm:block">
            Workbench
          </span>
        </a>

        <label className="relative ml-auto hidden h-11 w-full max-w-md items-center md:flex">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 z-10 h-4 w-4 text-slate/80"
          />
          <input
            type="search"
            aria-label="Search tasks"
            value={draft}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
            className="absolute inset-0 h-11 w-full rounded-xl border border-line bg-ink/[0.025] py-0 pl-10 pr-20 font-body text-sm font-medium text-ink shadow-[0_8px_24px_-18px_rgb(var(--ink-rgb)/0.35)] outline-none transition-colors duration-150 placeholder:text-slate/80 hover:bg-paper focus:border-line focus:ring-0"
          />
          <span className="pointer-events-none absolute right-3 z-10 inline-flex h-6 items-center rounded-md border border-line bg-paper px-2 font-mono text-[10px] font-bold text-slate shadow-ticket">
            Ctrl K
          </span>
        </label>

        <div className="ml-auto flex items-center gap-2 md:relative md:ml-0">
          <ThemeToggle />
          <NotificationButton
            count={notificationCount(summary)}
            open={notificationOpen}
            onClick={() => setNotificationOpen((open) => !open)}
          />
        </div>

        <UserMenu email={email} />

        {notificationOpen ? (
          <NotificationCard
            summary={summary}
            onClose={() => setNotificationOpen(false)}
          />
        ) : null}
      </div>
    </header>
  );
}

/** /board, carrying the current search along if there is one. */
function boardHref(search: string): string {
  const trimmed = search.trim();
  return trimmed ? `/board?search=${encodeURIComponent(trimmed)}` : "/board";
}
