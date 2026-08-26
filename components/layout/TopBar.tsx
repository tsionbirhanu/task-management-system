"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AlertCircle, Bell, CheckCircle2, Clock3, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { UserMenu } from "@/components/layout/UserMenu";

export interface TopBarProps {
  /** Signed-in address, or null in preview mode. */
  email?: string | null;
}

type NotificationSummary = {
  overdue: number;
  dueSoon: number;
  loading?: boolean;
  error?: boolean;
};

export function TopBar({ email = null }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState(searchParams.get("search") ?? "");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationSummary, setNotificationSummary] =
    useState<NotificationSummary>({
      overdue: 0,
      dueSoon: 0,
    });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(searchParams.get("search") ?? "");
  }, [searchParams]);

  const focusSearch = useCallback(() => {
    if (pathname !== "/board") {
      router.push(draft.trim() ? `/board?search=${encodeURIComponent(draft.trim())}` : "/board");
      return;
    }

    searchRef.current?.focus();
    window.dispatchEvent(new CustomEvent("workbench:focus-search"));
  }, [draft, pathname, router]);

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

  useEffect(() => {
    if (pathname !== "/board") return;

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
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [draft, pathname, router, searchParams]);

  function onSearchChange(value: string) {
    setDraft(value);

    if (pathname !== "/board") {
      router.push(value.trim() ? `/board?search=${encodeURIComponent(value.trim())}` : "/board");
    }
  }

  function showNotifications() {
    if (pathname !== "/board") {
      router.push("/board");
      setNotificationSummary({ overdue: 0, dueSoon: 0, loading: true });
      setNotificationOpen(true);
      return;
    }

    const event = new CustomEvent<{
      handled: boolean;
      summary: NotificationSummary | null;
    }>(
      "workbench:show-reminders",
      {
        detail: { handled: false, summary: null },
      },
    );

    window.dispatchEvent(event);

    setNotificationSummary(
      event.detail.summary ?? { overdue: 0, dueSoon: 0, loading: true },
    );
    setNotificationOpen(true);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
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
            ref={searchRef}
            type="search"
            aria-label="Search tasks"
            value={draft}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={focusSearch}
            placeholder="Search tasks..."
            className="absolute inset-0 h-11 w-full rounded-xl border border-line bg-[#f8f7fc] py-0 pl-10 pr-20 font-body text-sm font-medium text-ink shadow-[0_8px_24px_-18px_rgb(var(--ink-rgb)/0.35)] outline-none transition-colors duration-150 placeholder:text-slate/80 hover:bg-paper focus:border-line focus:ring-0"
          />
          <span className="pointer-events-none absolute right-3 z-10 inline-flex h-6 items-center rounded-md border border-line bg-paper px-2 font-mono text-[10px] font-bold text-slate shadow-ticket">
            Ctrl K
          </span>
        </label>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            aria-expanded={notificationOpen}
            onClick={showNotifications}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />
          </button>

          {notificationOpen ? (
            <NotificationCard
              summary={notificationSummary}
              onClose={() => setNotificationOpen(false)}
            />
          ) : null}
        </div>

        <UserMenu email={email} />
      </div>
    </header>
  );
}

function NotificationCard({
  summary,
  onClose,
}: {
  summary: NotificationSummary;
  onClose: () => void;
}) {
  const hasReminders = summary.overdue > 0 || summary.dueSoon > 0;

  return (
    <section className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-line bg-paper shadow-lift">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 className="font-body text-sm font-bold text-ink">Notifications</h2>
          <p className="font-body text-xs text-slate">Due date reminders</p>
        </div>
        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div className="grid gap-2 p-3">
        {summary.loading ? (
          <NotificationItem
            icon={<Clock3 aria-hidden="true" className="h-4 w-4" />}
            title="Loading reminders"
            message="Open board data is being checked."
            tone="slate"
          />
        ) : summary.error ? (
          <NotificationItem
            icon={<AlertCircle aria-hidden="true" className="h-4 w-4" />}
            title="Reminders unavailable"
            message="Refresh the board and try again."
            tone="danger"
          />
        ) : hasReminders ? (
          <>
            {summary.overdue > 0 ? (
              <NotificationItem
                icon={<AlertCircle aria-hidden="true" className="h-4 w-4" />}
                title="Overdue attention needed"
                message={`${summary.overdue} ${
                  summary.overdue === 1 ? "task is" : "tasks are"
                } overdue`}
                tone="danger"
              />
            ) : null}
            {summary.dueSoon > 0 ? (
              <NotificationItem
                icon={<Clock3 aria-hidden="true" className="h-4 w-4" />}
                title="Upcoming deadline"
                message={`${summary.dueSoon} ${
                  summary.dueSoon === 1 ? "task is" : "tasks are"
                } due within 24h`}
                tone="amber"
              />
            ) : null}
          </>
        ) : (
          <NotificationItem
            icon={<CheckCircle2 aria-hidden="true" className="h-4 w-4" />}
            title="All clear"
            message="No upcoming reminders right now."
            tone="done"
          />
        )}
      </div>
    </section>
  );
}

function NotificationItem({
  icon,
  title,
  message,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  tone: "slate" | "amber" | "danger" | "done";
}) {
  const toneClass = {
    slate: "bg-ink/[0.035] text-slate",
    amber: "bg-amber/10 text-amber",
    danger: "bg-danger/10 text-danger",
    done: "bg-done/10 text-done",
  }[tone];

  return (
    <article className="flex gap-3 rounded-xl border border-line bg-paper p-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${toneClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-body text-sm font-bold text-ink">{title}</h3>
        <p className="mt-0.5 font-body text-xs leading-5 text-slate">{message}</p>
      </div>
    </article>
  );
}
