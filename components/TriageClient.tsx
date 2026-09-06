"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  CalendarPlus,
  Hospital,
  Loader2,
  PhoneCall,
  Search,
  Siren,
  Stethoscope,
} from "lucide-react";

import TriageResult from "@/components/TriageResult";
import { addEmergency } from "@/lib/emergencies";
import { availableBeds, facilities, totalBeds } from "@/lib/data";
import {
  SEVERITY_EMOJI,
  SEVERITY_LABELS,
  SEVERITY_TO_LEVEL,
  type TriageResponse,
} from "@/lib/triage";
import { getTranslations, translations, type Language } from "@/lib/translations";

const LEGEND_STYLES: Record<string, string> = {
  green: "bg-emerald-50 ring-emerald-200 text-emerald-900",
  yellow: "bg-amber-50 ring-amber-200 text-amber-900",
  red: "bg-red-50 ring-red-200 text-red-900",
};

export default function TriageClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherLanguage: Language = lang === "hi" ? "en" : "hi";
  const otherTitle = translations[otherLanguage].triage.title;

  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Facility the red-severity case was escalated to (set once per result). */
  const [escalatedTo, setEscalatedTo] = useState<string | null>(null);
  /** Guards the save against StrictMode double-invocation of the effect. */
  const escalatedKeyRef = useRef<string | null>(null);

  // Prefill from the ASHA dashboard's quick-triage link (?s=<symptoms>).
  useEffect(() => {
    const prefilled = new URLSearchParams(window.location.search).get("s");
    if (prefilled) setSymptoms(prefilled);
  }, []);

  async function handleSubmit() {
    const text = symptoms.trim();
    if (!text || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setEscalatedTo(null);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: text, lang }),
      });
      const data = (await response.json()) as TriageResponse & { error?: string };
      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : lang === "hi"
            ? "कुछ गलत हो गया। फिर से कोशिश करें।"
            : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const recommendedFacility = result
    ? facilities.find((f) => f.level === result.result.facility_level)
    : undefined;

  // Emergency escalation — a red-severity result is auto-saved to the
  // shared store exactly once per triage result (ref guard survives
  // StrictMode's double effect invocation).
  useEffect(() => {
    if (!result || !recommendedFacility || result.result.severity !== "red") return;
    const escalationKey = `${result.result.severity_label}|${symptoms.trim()}|${recommendedFacility.id}`;
    if (escalatedKeyRef.current === escalationKey) return;
    escalatedKeyRef.current = escalationKey;
    addEmergency({
      id: `emg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      patientName: "Anonymous",
      phone: "",
      symptoms: symptoms.trim(),
      timestamp: new Date().toISOString(),
      facility: recommendedFacility.id,
      status: "escalated",
    });
    setEscalatedTo(recommendedFacility.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, recommendedFacility]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
          <Stethoscope className="h-4 w-4" />
          {t.triage.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.triage.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-blue-800 md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.triage.description}
        </p>
      </div>

      {/* Severity legend */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {(Object.keys(SEVERITY_TO_LEVEL) as (keyof typeof SEVERITY_TO_LEVEL)[]).map(
          (severity) => (
            <div
              key={severity}
              className={`flex items-center gap-3 rounded-2xl p-4 ring-1 ${LEGEND_STYLES[severity]}`}
            >
              <span className="text-2xl" aria-hidden="true">
                {SEVERITY_EMOJI[severity]}
              </span>
              <div>
                <p className="text-sm font-extrabold">
                  {SEVERITY_LABELS[severity][lang]}
                </p>
                <p className="text-xs opacity-80">
                  → {t.levels[SEVERITY_TO_LEVEL[severity]]}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Input card */}
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{t.triage.inputTitle}</h2>
            <p className="text-sm text-slate-500">{t.triage.inputHint}</p>
          </div>
        </div>

        <textarea
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
          rows={5}
          placeholder={t.triage.placeholder}
          className="mt-5 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">{t.triage.examplesLabel}</span>
          {t.triage.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setSymptoms(example)}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 transition hover:bg-blue-100"
            >
              {example}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!symptoms.trim() || loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-800/25 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          {t.triage.submit}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-blue-200 bg-white p-10 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-800" />
          <p className="mt-4 text-lg font-extrabold text-slate-800">
            {t.triage.loadingTitle}
          </p>
          <p className="text-sm text-slate-500">{t.triage.loadingSub}</p>
          <div className="mx-auto mt-6 max-w-md space-y-2.5">
            <div className="h-3 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-3/5 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mt-8 rounded-3xl bg-red-50 p-6 ring-1 ring-red-200">
          <p className="font-extrabold text-red-700">{t.triage.errorTitle}</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Result + recommended facility */}
      {result && !loading && recommendedFacility && (
        <div className="mt-8">
          {/* Emergency escalation banner (red severity only) */}
          {result.result.severity === "red" && escalatedTo && (
            <div
              role="alert"
              className="emergency-banner relative mb-4 overflow-hidden rounded-2xl bg-red-600 p-4 text-white shadow-lg shadow-red-600/30"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Siren className="h-7 w-7 shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-wide">
                    {t.triage.emergencyTitle}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-red-100">
                    <PhoneCall className="h-4 w-4 shrink-0" />
                    {t.escalation.notifiedBanner}
                  </p>
                </div>
                <span className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold ring-1 ring-white/30">
                  {recommendedFacility.name}
                </span>
              </div>
            </div>
          )}

          <TriageResult result={result.result} source={result.source} lang={lang} />

          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                  <Hospital className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t.triage.recommendedFacility}
                  </p>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {recommendedFacility.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {t.levels[recommendedFacility.level]} · {recommendedFacility.district}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  {availableBeds(recommendedFacility)}/{totalBeds(recommendedFacility)}{" "}
                  {t.triage.bedsAvailable}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-200">
                  {recommendedFacility.doctorCount} {t.stats.doctors}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {(["general", "icu", "maternity"] as const).map((category) => {
                const bed = recommendedFacility.beds[category];
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <BedDouble className="h-4 w-4 text-blue-700" />
                      {t.bedTypes[category]}
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {bed.available}
                      <span className="font-medium text-slate-400">/{bed.total}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/appointments"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 sm:w-auto"
            >
              <CalendarPlus className="h-5 w-5" />
              {t.triage.bookAppointment}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}