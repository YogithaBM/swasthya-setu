"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CheckCheck,
  MapPin,
  PhoneCall,
  Siren,
} from "lucide-react";

import { getFacilityById } from "@/lib/data";
import {
  getEmergencies,
  updateEmergencyStatus,
  type Emergency,
} from "@/lib/emergencies";
import { getTranslations, translations, type Language } from "@/lib/translations";

const STATUS_STYLES: Record<Emergency["status"], string> = {
  escalated: "bg-red-50 text-red-700 ring-red-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function EscalationClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].escalation.title;
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setEmergencies(getEmergencies());
  }, []);

  function handleResolve(id: string) {
    updateEmergencyStatus(id, "resolved");
    setEmergencies(getEmergencies());
    setToast(t.escalation.updated);
    window.setTimeout(() => setToast(null), 2500);
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const escalatedCount = emergencies.filter(
    (emergency) => emergency.status === "escalated"
  ).length;
  const resolvedCount = emergencies.length - escalatedCount;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-extrabold text-white shadow-xl"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 ring-1 ring-red-200">
          <Siren className="h-4 w-4" />
          {t.escalation.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.escalation.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-blue-800 md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.escalation.description}
        </p>
      </div>

      {/* Summary counts */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-red-50 p-5 text-red-700 ring-1 ring-red-200">
          <p className="text-3xl font-black">{escalatedCount}</p>
          <p className="mt-0.5 text-sm font-extrabold">{t.escalation.statusEscalated}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-700 ring-1 ring-emerald-200">
          <p className="text-3xl font-black">{resolvedCount}</p>
          <p className="mt-0.5 text-sm font-extrabold">{t.escalation.statusResolved}</p>
        </div>
      </div>

      {/* Escalation cards */}
      <div className="mt-6 space-y-3">
        {emergencies.map((emergency) => {
          const facility = getFacilityById(emergency.facility);
          return (
            <div
              key={emergency.id}
              className={`rounded-2xl bg-white p-5 shadow-sm ring-1 transition ${
                emergency.status === "escalated"
                  ? "ring-red-200"
                  : "ring-slate-200 opacity-90"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ring-1 ${STATUS_STYLES[emergency.status]}`}
                  aria-hidden="true"
                >
                  🚨
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-slate-800">
                      {emergency.patientName}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ring-1 ${STATUS_STYLES[emergency.status]}`}
                    >
                      {emergency.status === "escalated"
                        ? t.escalation.statusEscalated
                        : t.escalation.statusResolved}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {emergency.symptoms || t.escalation.notFound}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-red-500" />
                      {facility?.name ?? emergency.facility}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                      {formatTime(emergency.timestamp)}
                    </span>
                    {emergency.phone && (
                      <span>
                        📞 {emergency.phone}
                      </span>
                    )}
                  </div>
                </div>
                {emergency.status === "escalated" && (
                  <button
                    type="button"
                    onClick={() => handleResolve(emergency.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <CheckCheck className="h-4 w-4" />
                    {t.escalation.statusResolved}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {emergencies.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
            <Siren className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-400">
              {t.escalation.noEscalations}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
