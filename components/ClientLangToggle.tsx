"use client";

import { Moon, Sun } from "lucide-react";

import { getTranslations, type Language } from "@/lib/translations";
import { useTheme } from "@/lib/theme";

/** Floating language + theme pills for pages rendered without the top nav (login, access-denied). */
export default function ClientLangToggle({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const { theme, toggleTheme } = useTheme();

  function toggle() {
    const next = lang === "hi" ? "en" : "hi";
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        title={t.theme}
        aria-label={t.theme}
        className="ds-panel inline-flex h-9 items-center gap-1.5 px-3 text-xs font-extrabold text-ink transition"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-brand" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 text-brand" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={toggle}
        title={t.switchTo}
        aria-label={`${t.language}: ${lang === "hi" ? "हिन्दी" : "English"}. ${t.switchTo}`}
        className="ds-panel inline-flex h-9 items-center gap-1.5 px-3.5 text-xs font-extrabold text-ink transition"
      >
        <span aria-hidden="true">🌐</span>
        {lang === "hi" ? "हिन्दी" : "English"}
      </button>
    </div>
  );
}
