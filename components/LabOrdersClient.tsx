"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Microscope } from "lucide-react";

import { getFacilityById } from "@/lib/data";
import {
  getLabOrders,
  LAB_STATUSES,
  updateLabOrderStatus,
  type LabOrder,
  type LabStatus,
} from "@/lib/labOrders";
import { getTranslations, translations, type Language } from "@/lib/translations";

const STATUS_STYLES: Record<LabStatus, string> = {
  Pending: "bg-amber-50 text-amber-800 ring-amber-200",
  "Sample Collected": "bg-sky-50 text-sky-800 ring-sky-200",
  "Results Ready": "bg-emerald-50 text-emerald-700 ring-emerald-200",
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
    "Sample Collected": t.labOrders.statusSample,
    "Results Ready": t.labOrders.statusResults,
  };

  const counts: Record<LabStatus, number> = {
    Pending: orders.filter((o) => o.status === "Pending").length,
    "Sample Collected": orders.filter((o) => o.status === "Sample Collected").length,
    "Results Ready": orders.filter((o) => o.status === "Results Ready").length,
  };

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function handleStatusChange(id: string, status: LabStatus) {
    updateLabOrderStatus(id, status);
    setOrders(getLabOrders());
    showToast(t.labOrders.updated);
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
          className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-extrabold text-white shadow-xl"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 ring-1 ring-sky-200">
          <Microscope className="h-4 w-4" />
          {t.labOrders.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.labOrders.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-blue-800 md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.labOrders.description}
        </p>
      </div>

      {/* Summary counts */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {LAB_STATUSES.map((key) => (
          <div key={key} className={`rounded-2xl p-5 ring-1 ${STATUS_STYLES[key]}`}>
            <p className="text-3xl font-black">{counts[key]}</p>
            <p className="mt-0.5 text-sm font-extrabold">{statusLabel[key]}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colPatient}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colTests}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colFacility}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colDate}</th>
                <th className="px-3 py-2.5 font-bold">{t.labOrders.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const facility = getFacilityById(order.facility);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="px-3 py-3 font-extrabold text-slate-800">
                      {order.patientName}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {order.tests.map((test) => (
                          <span
                            key={test}
                            className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 ring-1 ring-sky-200"
                          >
                            <Microscope className="h-3 w-3" />
                            {test}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {facility?.name ?? order.facility}
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLES[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                        <select
                          value={order.status}
                          onChange={(event) =>
                            handleStatusChange(
                              order.id,
                              event.target.value as LabStatus
                            )
                          }
                          aria-label={t.labOrders.colStatus}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                        >
                          {LAB_STATUSES.map((status) => (
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
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center">
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
