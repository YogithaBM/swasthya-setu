"use client";

import Link from "next/link";
import { Moon, Stethoscope, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme";
import { getTranslations, type Language } from "@/lib/translations";

/**
 * Minimal public navbar for the open homepage (no role stored): brand on
 * the left, theme + language toggles and a Staff Login pill on the right.
 */
export default function PublicNav({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const { theme, toggleTheme } = useTheme();

  function toggleLanguage() {
    const next = lang === "hi" ? "en" : "hi";
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-panel shadow-sm">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Swasthya Setu" className="h-10 w-10 rounded-lg" />
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-ink-strong">
              {t.appName}
            </span>
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-ink-mute sm:block">
              {t.appNameRoman} · Health Bridge
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            title={t.theme}
            aria-label={t.theme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-panel-2 text-ink transition hover:bg-brand-soft hover:text-brand"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            title={t.switchTo}
            aria-label={`${t.language}: ${lang === "hi" ? "हिन्दी" : "English"}. ${t.switchTo}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-strong px-3.5 text-xs font-extrabold text-brand-strong-ink transition hover:bg-brand"
          >
            <span aria-hidden="true">🌐</span>
            {lang === "hi" ? "हिन्दी" : "English"}
          </button>
          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-xs font-bold text-ink transition hover:bg-panel-2"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.staffLoginLink}</span>
            <span className="sm:hidden">{t.login.title}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
