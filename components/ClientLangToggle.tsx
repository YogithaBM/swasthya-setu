"use client";

import { getTranslations, type Language } from "@/lib/translations";

/** Floating language pill for pages rendered without the top nav (login, access-denied). */
export default function ClientLangToggle({ lang }: { lang: Language }) {
  const t = getTranslations(lang);

  function toggle() {
    const next = lang === "hi" ? "en" : "hi";
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={t.switchTo}
      aria-label={`${t.language}: ${lang === "hi" ? "हिन्दी" : "English"}. ${t.switchTo}`}
      className="fixed right-4 top-4 z-50 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-extrabold text-blue-900 shadow-md ring-1 ring-slate-200 transition hover:bg-blue-50"
    >
      <span aria-hidden="true">🌐</span>
      {lang === "hi" ? "हिन्दी" : "English"}
    </button>
  );
}