"use client";

import Link from "next/link";
import { HeartPulse, Moon, Stethoscope, Sun } from "lucide-react";

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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/40 bg-white/70 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/30">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-md shadow-teal-600/30">
            <HeartPulse className="h-5 w-5 text-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {t.appName}
            </span>
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block dark:text-slate-400">
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700"
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
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 px-3.5 text-xs font-extrabold text-white shadow-md shadow-teal-600/25 transition hover:shadow-lg"
          >
            <span aria-hidden="true">🌐</span>
            {lang === "hi" ? "हिन्दी" : "English"}
          </button>
          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white/60 px-3 text-xs font-bold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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
