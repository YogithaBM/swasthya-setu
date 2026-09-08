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
  SEVERITY_LABELS,
  SEVERITY_TO_LEVEL,
  type TriageResponse,
} from "@/lib/triage";
import { getTranslations, translations, type Language } from "@/lib/translations";

/** Legend chips — shape + colour + label per the design system. */
const LEGEND_STYLES: Record<string, { status: string; shape: string }> = {
  green: { status: "ds-status-safe", shape: "ds-shape-circle" },
  yellow: { status: "ds-status-attention", shape: "ds-shape-triangle" },
  red: { status: "ds-status-emergency", shape: "ds-shape-octagon" },
};

export default function TriageClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherLanguage: Language = lang === "hi" ? "en" : "hi";
  const otherTitle = translations[otherLanguage].triage.title;

  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  /** After 10s the API route switches to the local fallback — update the label. */
  const [slowLoading, setSlowLoading] = useState(false);
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
    setSlowLoading(false);
    setError(null);
    setResult(null);
    setEscalatedTo(null);

    // The API route returns the local keyword result after 10s — flip the
    // loading label to match so the user knows quick analysis took over.
    const slowTimer = setTimeout(() => setSlowLoading(true), 10_000);

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
      clearTimeout(slowTimer);
      setSlowLoading(false);
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
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
          {t.triage.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-brand md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-mute md:text-base">
          {t.triage.description}
        </p>
      </div>

      {/* Severity legend — shape + colour + label together */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {(Object.keys(SEVERITY_TO_LEVEL) as (keyof typeof SEVERITY_TO_LEVEL)[]).map(
          (severity) => (
            <div
              key={severity}
              className={`ds-status ${LEGEND_STYLES[severity].status} justify-center`}
            >
              <span className={`ds-shape ${LEGEND_STYLES[severity].shape}`} />
              <span>
                <span className="block text-sm font-extrabold">
                  {SEVERITY_LABELS[severity][lang]}
                </span>
                <span className="block text-xs font-semibold opacity-80">
                  → {t.levels[SEVERITY_TO_LEVEL[severity]]}
                </span>
              </span>
            </div>
          )
        )}
      </div>

      {/* Input card */}
      <div className="ds-panel mt-6 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-ink-strong">{t.triage.inputTitle}</h2>
            <p className="text-sm text-ink-mute">{t.triage.inputHint}</p>
          </div>
        </div>

        <textarea
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
          rows={5}
          placeholder={t.triage.placeholder}
          className="ds-input mt-5 resize-y py-3.5"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-faint">{t.triage.examplesLabel}</span>
          {t.triage.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setSymptoms(example)}
              className="rounded-md bg-panel-2 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-brand-soft hover:text-brand"
            >
              {example}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!symptoms.trim() || loading}
          className="ds-btn ds-btn-primary mt-6 w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          {t.triage.submit}
        </button>
      </div>

      {/* Loading state — skeleton shimmer */}
      {loading && (
        <div className="ds-panel mt-8 p-10 text-center">
          <p className="text-lg font-extrabold text-ink-strong">
            {t.triage.loadingTitle}
          </p>
          <p className="mt-1 text-sm text-ink-mute">
            {slowLoading ? t.triage.loadingQuickSub : t.triage.loadingSub}
          </p>
          <div className="mx-auto mt-6 max-w-md space-y-2.5">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-4/5" />
            <div className="skeleton h-3 w-3/5" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="ds-panel mt-8 border-status-emergency p-6">
          <p className="font-extrabold text-status-emergency">{t.triage.errorTitle}</p>
          <p className="mt-1 text-sm text-status-emergency">{error}</p>
        </div>
      )}

      {/* Result + recommended facility */}
      {result && !loading && recommendedFacility && (
        <div className="mt-8">
          {/* Emergency escalation banner (red severity only) */}
          {result.result.severity === "red" && escalatedTo && (
            <div
              role="alert"
              className="emergency-banner relative mb-4 flex flex-wrap items-center gap-3 overflow-hidden rounded-lg border-2 border-status-emergency bg-status-emergency p-4 text-white"
            >
              <Siren className="h-7 w-7 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-wide">
                  {t.triage.emergencyTitle}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold opacity-90">
                  <PhoneCall className="h-4 w-4 shrink-0" />
                  {t.escalation.notifiedBanner}
                </p>
              </div>
              <span className="ml-auto rounded-md bg-white/15 px-3 py-1 text-xs font-extrabold">
                {recommendedFacility.name}
              </span>
            </div>
          )}

          <TriageResult result={result.result} source={result.source} lang={lang} />

          <div className="ds-panel mt-6 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  <Hospital className="h-6 w-6" />
                </div>
                <div>
                  <p className="ds-label">{t.triage.recommendedFacility}</p>
                  <h3 className="text-lg font-extrabold text-ink-strong">
                    {recommendedFacility.name}
                  </h3>
                  <p className="text-sm text-ink-mute">
                    {t.levels[recommendedFacility.level]} · {recommendedFacility.district}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-panel-2 px-3 py-1.5 text-xs font-bold text-ink">
                  {availableBeds(recommendedFacility)}/{totalBeds(recommendedFacility)}{" "}
                  {t.triage.bedsAvailable}
                </span>
                <span className="rounded-md bg-panel-2 px-3 py-1.5 text-xs font-bold text-ink">
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
                    className="flex items-center justify-between rounded-lg border border-line bg-panel-2 px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">
                      <BedDouble className="h-4 w-4 text-brand" />
                      {t.bedTypes[category]}
                    </span>
                    <span className="text-sm font-extrabold text-ink-strong">
                      {bed.available}
                      <span className="font-medium text-ink-faint">/{bed.total}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/appointments"
              className="ds-btn ds-btn-primary mt-6 w-full sm:w-auto"
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