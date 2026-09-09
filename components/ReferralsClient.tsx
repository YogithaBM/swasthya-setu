"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, CheckCircle2 } from "lucide-react";

import { getFacilityById } from "@/lib/data";
import {
  getReferrals,
  updateReferralStatus,
  type Referral,
  type ReferralStatus,
} from "@/lib/referrals";
import { getTranslations, translations, type Language } from "@/lib/translations";

const REFERRAL_STATUSES: ReferralStatus[] = ["Pending", "In-Transit", "Completed"];

const STATUS_STYLES: Record<ReferralStatus, string> = {
  Pending: "bg-status-attention-tint text-status-attention ring-amber-200",
  "In-Transit": "bg-brand-tint text-brand ring-blue-200",
  Completed: "bg-status-safe-tint text-status-safe ring-emerald-200",
};

export default function ReferralsClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].referrals.title;
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setReferrals(getReferrals());
  }, []);

  const statusLabel: Record<ReferralStatus, string> = {
    Pending: t.referrals.statusPending,
    "In-Transit": t.referrals.statusInTransit,
    Completed: t.referrals.statusCompleted,
  };

  const counts: Record<ReferralStatus, number> = {
    Pending: referrals.filter((r) => r.status === "Pending").length,
    "In-Transit": referrals.filter((r) => r.status === "In-Transit").length,
    Completed: referrals.filter((r) => r.status === "Completed").length,
  };

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function handleStatusChange(id: string, status: ReferralStatus) {
    updateReferralStatus(id, status);
    setReferrals(getReferrals());
    showToast(t.referrals.updated);
  }

  function formatDate(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(
      lang === "hi" ? "hi-IN" : "en-IN",
      { day: "numeric", month: "short", year: "numeric" }
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 ds-toast rounded-xl px-4 py-3 text-center text-sm font-extrabold text-status-safe "
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.referrals.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-brand md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.referrals.description}
        </p>
      </div>

      {/* Summary counts */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {REFERRAL_STATUSES.map((key) => (
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
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2.5 font-bold">{t.referrals.colPatient}</th>
                <th className="px-3 py-2.5 font-bold">{t.referrals.colFrom}</th>
                <th className="px-3 py-2.5 font-bold">{t.referrals.colTo}</th>
                <th className="px-3 py-2.5 font-bold">{t.referrals.colDate}</th>
                <th className="px-3 py-2.5 font-bold">{t.referrals.colReason}</th>
                <th className="px-3 py-2.5 font-bold">{t.referrals.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => {
                const from = getFacilityById(referral.fromFacility);
                const to = getFacilityById(referral.toFacility);
                return (
                  <tr
                    key={referral.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-brand-tint/40"
                  >
                    <td className="px-3 py-3 font-extrabold text-slate-800">
                      {referral.patientName}
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {from?.name ?? referral.fromFacility}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand">
                        <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-status-emergency" />
                        {to?.name ?? referral.toFacility}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {formatDate(referral.date)}
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {referral.reason}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLES[referral.status]}`}
                        >
                          {statusLabel[referral.status]}
                        </span>
                        <select
                          value={referral.status}
                          onChange={(event) =>
                            handleStatusChange(
                              referral.id,
                              event.target.value as ReferralStatus
                            )
                          }
                          aria-label={t.referrals.colStatus}
                          className="ds-input px-2 py-1.5 text-xs font-bold text-slate-700"
                        >
                          {REFERRAL_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {referrals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-400">
                      {t.referrals.noReferrals}
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
