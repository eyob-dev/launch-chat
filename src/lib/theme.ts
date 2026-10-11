/**
 * Tiny theme store for light/dark mode.
 *
 * The actual class on <html> is set by an inline pre-paint script in the root
 * layout (to avoid a flash of the wrong theme). This module exposes a small
 * pub/sub so React can read and toggle that value without a setState-in-effect
 * (which would both fail lint and risk hydration mismatches).
 *
 * It is consumed via React's `useSyncExternalStore`, which is the recommended
 * way to read browser-only state safely during SSR/hydration.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "ucl-theme";
const DARK_MEDIA = "(prefers-color-scheme: dark)";

/** Read the theme currently applied to the document (set pre-paint). */
export function getAppliedTheme(): Theme {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
  }
  if (typeof window !== "undefined" && window.matchMedia(DARK_MEDIA).matches) {
    return "dark";
  }
  return "light";
}

/** Apply a theme to the DOM and persist the user's choice. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage may be unavailable; ignore gracefully
  }
}

const listeners = new Set<() => void>();

export function subscribeTheme(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Flip to the opposite theme, persist it, and notify subscribers. */
export function toggleTheme(): void {
  applyTheme(getAppliedTheme() === "dark" ? "light" : "dark");
  listeners.forEach((l) => l());
}
