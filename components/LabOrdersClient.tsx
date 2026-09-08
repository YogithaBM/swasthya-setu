"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FlaskConical, Microscope } from "lucide-react";

import { getFacilityById } from "@/lib/data";
import {
  getLabOrders,
  markLabOrderComplete,
  type LabOrder,
  type LabStatus,
} from "@/lib/labOrders";
import { getTranslations, translations, type Language } from "@/lib/translations";

const STATUS_STYLES: Record<LabStatus, string> = {
  Pending: "bg-status-attention-tint text-status-attention ring-amber-200",
  Completed: "bg-status-safe-tint text-status-safe ring-emerald-200",
};

export default function LabOrdersClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].labOrders.title;
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getLabOrders());
  }, []);

  const statusLabel: Record<LabStatus, string> = {
    Pending: t.labOrders.statusPending,
    Completed: t.labOrders.statusCompleted,
  };

  const pendingCount = orders.filter((order) => order.status === "Pending").length;
  const completedCount = orders.filter((order) => order.status === "Completed").length;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function handleMarkComplete(id: string) {
    markLabOrderComplete(id);
    setOrders(getLabOrders());
    showToast(t.labOrders.completedToast);
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
          {t.labOrders.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-brand md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.labOrders.description}
        </p>
      </div>

      {/* Summary counts */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-status-attention-tint p-5 text-status-attention ring-1 ring-amber-200">
          <p className="text-3xl font-black">{pendingCount}</p>
          <p className="mt-0.5 text-sm font-extrabold">{t.labOrders.statusPending}</p>
        </div>
        <div className="rounded-2xl bg-status-safe-tint p-5 text-status-safe ring-1 ring-emerald-200">
          <p className="text-3xl font-black">{completedCount}</p>
          <p className="mt-0.5 text-sm font-extrabold">{t.labOrders.statusCompleted}</p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 ds-panel p-6 md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colPatient}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colTests}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colFacility}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colDate}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colStatus}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colResult}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const facility = getFacilityById(order.facility);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-brand-tint/40"
                  >
                    <td className="px-3 py-3 font-extrabold text-slate-800">
                      {order.patientName}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-panel-2 px-2 py-0.5 text-[11px] font-bold text-ink-mute ring-1 ring-sky-200">
                        <Microscope className="h-3 w-3" />
                        {order.testName}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {facility?.name ?? order.facility}
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {formatDate(order.dateOrdered)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLES[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                        {order.status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => handleMarkComplete(order.id)}
                            title={t.labOrders.markComplete}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            <FlaskConical className="h-3.5 w-3.5" />
                            {t.labOrders.markComplete}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-600">
                      {order.result || "—"}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-400">
                      {t.labOrders.noOrders}
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
