"use client";

import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";

import ClientLangToggle from "@/components/ClientLangToggle";
import { getRole } from "@/lib/auth";
import { getTranslations, translations, type Language } from "@/lib/translations";

export default function AccessDeniedClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].accessDenied.title;
  const role = getRole();

  return (
    <>
      <ClientLangToggle lang={lang} />
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 ring-8 ring-red-50">
        <ShieldX className="h-10 w-10" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl">
        {t.accessDenied.title}
      </h1>
      <p className="mt-2 text-lg font-bold text-red-600 md:text-xl">{otherTitle}</p>
      <p className="mt-4 text-sm leading-relaxed text-slate-500 md:text-base">
        {t.accessDenied.description}
      </p>

      {role && (
        <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
          {t.accessDenied.roleLabel}:
          <span className="font-extrabold text-slate-800">
            {role === "doctor"
              ? t.accessDenied.roleDoctor
              : role === "asha"
                ? t.accessDenied.roleAsha
                : t.accessDenied.rolePatient}
          </span>
        </span>
      )}

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.backHome}
      </Link>
    </div>
    </>
  );
}