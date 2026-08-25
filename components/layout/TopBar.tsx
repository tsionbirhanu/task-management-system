"use client";

import { UserMenu } from "@/components/layout/UserMenu";

export interface TopBarProps {
  /** Signed-in address, or null in preview mode. */
  email?: string | null;
}

/**
 * The slim rail across the top: wordmark, search, account. Deliberately plain
 * -- everything memorable happens on the ticket cards below it.
 */
export function TopBar({ email = null }: TopBarProps) {
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

        <div className="ml-auto">
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  );
}
