"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { LogOut, UserRound } from "lucide-react";

import { SearchInput } from "@/components/tasks/SearchInput";
import { authClient } from "@/lib/auth/client";

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
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

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

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          <span className="inline-flex items-center gap-2 rounded-md border border-line px-2.5 py-1.5 font-body text-xs text-slate">
            <UserRound aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="max-w-[10rem] truncate">{email ?? "Account"}</span>
          </span>
          {email ? (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1.5 font-body text-xs text-slate transition-colors duration-150 ease-out hover:bg-ink/[0.04] hover:text-ink"
            >
              <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
