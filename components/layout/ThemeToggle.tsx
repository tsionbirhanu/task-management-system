"use client";

import { useEffect, useState } from "react";

import { Moon, Sun } from "lucide-react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "workbench-theme";

/**
 * The class the CSS reads, plus the hint the browser needs for its own widgets
 * (scrollbars, form controls). Kept together so they can never disagree.
 */
function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function readStoredTheme(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;

  return "light";
}

/**
 * Light/dark toggle.
 *
 * The document is already painted with the saved theme before React runs -- an
 * inline script in the root layout does that to avoid a flash. With nothing
 * saved, Workbench starts in light mode.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    applyTheme(stored);
    setTheme(stored);
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }

  const label = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate transition-colors duration-150 hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="h-5 w-5" />
      ) : (
        <Moon aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );
}
