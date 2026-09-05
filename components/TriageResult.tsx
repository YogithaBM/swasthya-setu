import {
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Lightbulb,
  Siren,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  FACILITY_EN_LABELS,
  SEVERITY_EMOJI,
  SEVERITY_LABELS,
  type TriageResultData,
  type TriageSeverity,
} from "@/lib/triage";
import { getTranslations, type Language } from "@/lib/translations";

interface SeverityStyle {
  card: string;
  iconBg: string;
  icon: LucideIcon;
}

const SEVERITY_STYLES: Record<TriageSeverity, SeverityStyle> = {
  green: {
    card: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-emerald-500/30",
    iconBg: "bg-white/20",
    icon: CheckCircle2,
  },
  yellow: {
    card: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-amber-500/30",
    iconBg: "bg-white/25",
    icon: AlertTriangle,
  },
  red: {
    card: "bg-gradient-to-br from-red-500 via-red-600 to-rose-700 shadow-red-500/30",
    iconBg: "bg-white/20",
    icon: Siren,
  },
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
  const StatusIcon = style.icon;
  const severityLabel = SEVERITY_LABELS[severity][lang];

  return (
    <div
      className={`overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/30 ${style.card}`}
      role="alert"
    >
      {/* Header: emoji + severity label + source badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-7 md:px-10 md:pt-9">
        <div className="flex items-center gap-4">
          <span className="text-4xl md:text-5xl" aria-hidden="true">
            {SEVERITY_EMOJI[severity]}
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
              {t.triage.resultLabel}
            </p>
            <h2 className="mt-0.5 text-3xl font-extrabold leading-tight text-white md:text-5xl">
              {severityLabel}
            </h2>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
          <Sparkles className="h-3.5 w-3.5" />
          {source === "gemini" ? t.triage.sourceGemini : t.triage.sourceOffline}
        </span>
      </div>

      <div className="px-6 pb-8 pt-6 md:px-10 md:pb-10">
        {/* Recommended facility strip */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white/15 p-4 backdrop-blur-sm md:p-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
          >
            <StatusIcon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              {t.triage.recommendedFacility}
            </p>
            <p className="mt-0.5 text-lg font-extrabold leading-tight text-white md:text-xl">
              {FACILITY_EN_LABELS[result.facility_level]}
              <span className="ml-2 text-sm font-semibold text-white/85">
                · {t.levels[result.facility_level]}
              </span>
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="mt-4 rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            {t.triage.reason}
          </p>
          <p className="mt-1.5 text-base font-medium leading-relaxed text-white">
            {result.reason}
          </p>
        </div>

        {/* Quick advice */}
        <div className="mt-4 rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/80">
            <Lightbulb className="h-4 w-4" />
            {t.triage.advice}
          </p>
          <p className="mt-1.5 text-base leading-relaxed text-white">{result.advice}</p>
        </div>

        {/* Emergency strip (red only) */}
        {severity === "red" && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-red-950/40 p-4 ring-1 ring-red-200/40">
            <Ambulance className="h-6 w-6 shrink-0 text-red-100" />
            <p className="text-sm font-bold leading-relaxed text-red-50">
              {t.triage.emergencyStrip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}