"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_KEY = "swasthya_theme";
export const DEFAULT_THEME: Theme = "light";

/** Read the persisted theme (server-safe: returns the default off-client). */
export function getTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const raw = window.localStorage.getItem(THEME_KEY);
  return raw === "dark" ? "dark" : "light";
}

/** Persist a theme choice. */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, theme);
}

/** Apply the theme by toggling the `dark` class on <html> (Tailwind contract). */
export function applyThemeClass(theme: Theme): void {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Theme state hook. Resolves the stored preference after mount (SSR-safe),
 * keeps <html class="dark"> in sync, and exposes a persisted toggle.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const stored = getTheme();
    setThemeState(stored);
    applyThemeClass(stored);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((previous) => {
      const next: Theme = previous === "dark" ? "light" : "dark";
      setTheme(next);
      applyThemeClass(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
