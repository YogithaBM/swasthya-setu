import {
  Ambulance,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

import {
  FACILITY_EN_LABELS,
  SEVERITY_LABELS,
  type TriageResultData,
  type TriageSeverity,
} from "@/lib/triage";
import { getTranslations, type Language } from "@/lib/translations";

/**
 * Triage result — the most consequential surface in the app, so it follows
 * the "shape + colour + label" rule strictly: circle = safe, triangle =
 * attention, octagon = emergency. Emergency is visually loudest in both
 * themes (heaviest border + shadow).
 */
interface SeverityStyle {
  /** Shape class from the design system. */
  shape: string;
  /** Icon shown in the facility strip (literal, not decorative). */
  icon: LucideIcon;
}

const SEVERITY_STYLES: Record<TriageSeverity, SeverityStyle> = {
  green: {
    shape: "ds-shape-circle",
    icon: Ambulance,
  },
  yellow: {
    shape: "ds-shape-triangle",
    icon: Ambulance,
  },
  red: {
    shape: "ds-shape-octagon",
    icon: Ambulance,
  },
};

const STATUS_CLASS: Record<TriageSeverity, string> = {
  green: "ds-status-safe",
  yellow: "ds-status-attention",
  red: "ds-status-emergency",
};

interface TriageResultProps {
  result: TriageResultData;
  source: "gemini" | "fallback";
  lang: Language;
}

export default function TriageResult({ result, source, lang }: TriageResultProps) {
  const t = getTranslations(lang);
  const { severity } = result;
  const style = SEVERITY_STYLES[severity];
  const severityLabel = SEVERITY_LABELS[severity][lang];

  return (
    <div
      className={`ds-panel overflow-hidden border-2 ${STATUS_CLASS[severity]} flex-col items-stretch gap-0 p-6 md:p-8`}
      role="alert"
    >
      {/* Header: severity shape + bilingual label + source */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className={`ds-status ${STATUS_CLASS[severity]} -m-2 border-0 bg-transparent p-0`}>
          <span className={`ds-shape ${style.shape}`} />
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-widest opacity-75">
              {t.triage.resultLabel}
            </span>
            <span className="block text-3xl font-extrabold leading-tight md:text-4xl">
              {severityLabel}
            </span>
          </span>
        </span>
        <span className="rounded-md bg-panel-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-mute">
          {source === "gemini" ? t.triage.sourceGemini : t.triage.sourceOffline}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {/* Recommended facility strip */}
        <div className="rounded-lg border border-line bg-panel-2 p-4">
          <p className="ds-label">{t.triage.recommendedFacility}</p>
          <p className="text-lg font-extrabold leading-tight text-ink-strong">
            {FACILITY_EN_LABELS[result.facility_level]}
            <span className="ml-2 text-sm font-semibold text-ink-mute">
              · {t.levels[result.facility_level]}
            </span>
          </p>
        </div>

        {/* Reason */}
        <div className="rounded-lg border border-line bg-panel-2 p-4">
          <p className="ds-label">{t.triage.reason}</p>
          <p className="text-base font-medium leading-relaxed text-ink">
            {result.reason}
          </p>
        </div>

        {/* Quick advice */}
        <div className="rounded-lg border border-line bg-panel-2 p-4">
          <p className="ds-label flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {t.triage.advice}
          </p>
          <p className="text-base leading-relaxed text-ink">{result.advice}</p>
        </div>

        {/* Emergency strip (red only) — loudest element on the page */}
        {severity === "red" && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-status-emergency bg-status-emergency-tint p-4">
            <Ambulance className="h-6 w-6 shrink-0 text-status-emergency" />
            <p className="text-sm font-bold leading-relaxed text-status-emergency">
              {t.triage.emergencyStrip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
