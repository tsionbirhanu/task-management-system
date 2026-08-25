"use client";

import { useState } from "react";

import { UserRound } from "lucide-react";

import { SearchInput } from "@/components/tasks/SearchInput";

export interface TopBarProps {
  /** Signed-in address, or null in preview mode. */
  email?: string | null;
}

/**
 * The slim rail across the top: wordmark, search, account. Deliberately plain
 * -- everything memorable happens on the ticket cards below it.
 */
export function TopBar({ email }: TopBarProps) {
  // Scaffold: local only. Next phase lifts this into the board's filters.
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <a
          href="/board"
          className="flex shrink-0 items-center gap-2 rounded"
          aria-label="Workbench home"
        >
          <span aria-hidden="true" className="h-4 w-1.5 rounded-sm bg-amber" />
          <span className="font-display text-base font-bold tracking-tight text-ink">
            Workbench
          </span>
        </a>

        <div className="ml-auto hidden flex-1 justify-center sm:flex">
          <SearchInput
            className="w-full max-w-md"
            value={query}
            onChange={setQuery}
          />
        </div>

        <button
          type="button"
          className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-md border border-line px-2.5 py-1.5 font-body text-xs text-slate transition-colors duration-150 ease-out hover:border-slate/40 hover:text-ink sm:ml-0"
        >
          <UserRound aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="max-w-[10rem] truncate">{email ?? "Account"}</span>
        </button>
      </div>
    </header>
  );
}
