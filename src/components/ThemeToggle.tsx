"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ucl-theme";
const THEME_EVENT = "ucl-theme-change";

/**
 * Theme is treated as an external store: the single source of truth is the
 * `dark`/`light` class on <html>, which is set by the inline pre-paint script
 * in the root layout before React loads. `useSyncExternalStore` is the
 * officially recommended way to read such external state during SSR without
 * hydration mismatches or a flash of the wrong theme.
 */
function getSnapshot(): Theme {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
  }
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

// On the server we can't know the user's preference, so we render the light
// theme. The pre-paint script has already applied the correct class in the
// browser, so there is no visible flash after hydration.
function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage may be unavailable; ignore gracefully
  }
  // Notify any mounted toggles so they re-render from the new snapshot.
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/70 text-gray-700 shadow-sm transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}


