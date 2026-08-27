"use client";

import { useEffect, useRef, useState } from "react";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search tasks...",
  className,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [draft, onChange, value]);

  useEffect(() => {
    function focusSearch() {
      inputRef.current?.focus();
    }

    window.addEventListener("workbench:focus-search", focusSearch);
    return () => window.removeEventListener("workbench:focus-search", focusSearch);
  }, []);

  function clearSearch() {
    setDraft("");
    if (value) onChange("");
  }

  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
      />
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label="Search tasks"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-xl border border-line bg-ink/[0.025] pl-10 pr-9",
          "font-body text-sm font-medium text-ink placeholder:text-slate/80",
          "transition-colors duration-150 ease-out hover:bg-paper",
          "focus-visible:border-line focus-visible:outline-none",
        )}
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          title="Clear search"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          <X aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
