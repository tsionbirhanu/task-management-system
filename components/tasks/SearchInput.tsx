"use client";

import { Search } from "lucide-react";

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
  placeholder = "Search tickets",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
      />
      <input
        type="search"
        role="searchbox"
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-md border border-line bg-paper pl-9 pr-3",
          "font-body text-sm text-ink placeholder:text-slate/60",
          "transition-colors duration-150 ease-out hover:border-slate/40",
        )}
      />
    </div>
  );
}
