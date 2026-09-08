"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

import { getFacilityById } from "@/lib/data";
import { getFollowups, type Followup } from "@/lib/followups";
import { getTranslations, translations, type Language } from "@/lib/translations";

type DueStatus = "overdue" | "today" | "upcoming";

const DUE_RANK: Record<DueStatus, number> = { overdue: 0, today: 1, upcoming: 2 };

const STATUS_STYLES: Record<DueStatus, string> = {
  overdue: "bg-status-emergency-tint text-status-emergency ring-red-200",
  today: "bg-status-attention-tint text-status-attention ring-amber-200",
  upcoming: "bg-status-safe-tint text-status-safe ring-emerald-200",
};

const ROW_ACCENT: Record<DueStatus, string> = {
  overdue: "border-l-red-400",
  today: "border-l-amber-400",
  upcoming: "border-l-emerald-500",
};

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function FollowupClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].followup.title;
  const [followups, setFollowups] = useState<Followup[]>([]);

  useEffect(() => {
    setFollowups(getFollowups());
  }, []);

  const today = localDateString(new Date());

  function dueStatus(followup: Followup): DueStatus {
    if (followup.followUpDate < today) return "overdue";
    if (followup.followUpDate === today) return "today";
    return "upcoming";
  }

  const statusLabel: Record<DueStatus, string> = {
    overdue: t.followup.statusOverdue,
    today: t.followup.statusToday,
    upcoming: t.followup.statusUpcoming,
  };

  const sorted = [...followups].sort(
    (a, b) =>
      DUE_RANK[dueStatus(a)] - DUE_RANK[dueStatus(b)] ||
      a.followUpDate.localeCompare(b.followUpDate)
  );

  const counts: Record<DueStatus, number> = {
    overdue: 0,
    today: 0,
    upcoming: 0,
  };
  for (const followup of followups) counts[dueStatus(followup)] += 1;

  function formatDate(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(
      lang === "hi" ? "hi-IN" : "en-IN",
      { day: "numeric", month: "short", year: "numeric" }
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      {/* Header */}
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.followup.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-brand md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.followup.description}
        </p>
      </div>

      {/* Summary counts */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {(["overdue", "today", "upcoming"] as DueStatus[]).map((key) => (
          <div
            key={key}
            className={`rounded-2xl p-5 ring-1 ${STATUS_STYLES[key]}`}
          >
            <p className="text-3xl font-black">{counts[key]}</p>
            <p className="mt-0.5 text-sm font-extrabold">{statusLabel[key]}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 ds-panel p-6 md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2.5 font-bold">{t.followup.colPatient}</th>
                <th className="px-3 py-2.5 font-bold">{t.followup.colDiagnosis}</th>
                <th className="px-3 py-2.5 font-bold">{t.followup.colDate}</th>
                <th className="px-3 py-2.5 font-bold">{t.followup.colFacility}</th>
                <th className="px-3 py-2.5 font-bold">{t.followup.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((followup) => {
                const status = dueStatus(followup);
                const facility = getFacilityById(followup.facility);
                return (
                  <tr
                    key={followup.id}
                    className={`border-l-4 ${ROW_ACCENT[status]} border-b border-slate-100 transition last:border-0 hover:bg-brand-tint/40`}
                  >
                    <td className="px-3 py-3 font-extrabold text-slate-800">
                      {followup.patientName}
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {followup.diagnosis}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                        <CalendarClock className="h-3.5 w-3.5 text-brand" />
                        {formatDate(followup.followUpDate)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {facility?.name ?? followup.facility}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLES[status]}`}
                      >
                        {statusLabel[status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-400">
                      {t.followup.noFollowups}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
