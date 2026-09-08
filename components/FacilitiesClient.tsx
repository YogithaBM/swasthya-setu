"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { BedDouble, Hospital, MapPin, Search, Stethoscope, X } from "lucide-react";

import {
  availableBeds,
  bedStatusKey,
  facilities,
  freePercent,
  LEVEL_COLORS,
  totalBeds,
  type BedFreeStatus,
  type FacilityLevel,
} from "@/lib/data";
import { getTranslations, translations, type Language } from "@/lib/translations";

// Leaflet touches `window`, so the map is only ever loaded in the browser.
const FacilityMap = dynamic(() => import("@/components/FacilityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-slate-100" />
  ),
});

const LEVEL_ORDER: FacilityLevel[] = [
  "sub_centre",
  "phc",
  "rural_hospital",
  "district_hospital",
];

const BED_STATUS_STYLES: Record<BedFreeStatus, string> = {
  good: "bg-status-safe-tint text-status-safe ring-emerald-200",
  fair: "bg-status-attention-tint text-status-attention ring-amber-200",
  low: "bg-status-emergency-tint text-status-emergency ring-red-200",
};

const BED_STATUS_DOTS: Record<BedFreeStatus, string> = {
  good: "bg-emerald-500",
  fair: "bg-amber-500",
  low: "bg-red-500",
};

export default function FacilitiesClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].facilities.title;
  const [query, setQuery] = useState("");

  const summary = useMemo(
    () => ({
      facilityCount: facilities.length,
      totalBedsSum: facilities.reduce((sum, f) => sum + totalBeds(f), 0),
      availableSum: facilities.reduce((sum, f) => sum + availableBeds(f), 0),
      doctorSum: facilities.reduce((sum, f) => sum + f.doctorCount, 0),
    }),
    []
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return facilities;
    return facilities.filter((facility) => {
      const haystack = [
        facility.name,
        facility.district,
        facility.level,
        t.levels[facility.level],
        translations.en.levels[facility.level],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, t]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
          {t.facilities.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-brand md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.facilities.description}
        </p>
      </div>

      {/* Network summary */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200">
          <MapPin className="h-4 w-4 text-brand" />
          {summary.facilityCount} {t.stats.facilities}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200">
          <BedDouble className="h-4 w-4 text-status-safe" />
          {summary.availableSum}/{summary.totalBedsSum} {t.triage.bedsAvailable}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200">
          <Stethoscope className="h-4 w-4 text-brand" />
          {summary.doctorSum} {t.stats.doctors}
        </span>
      </div>

      {/* Map card */}
      <div className="mt-8 ds-panel p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 px-2 pb-4 pt-1">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              <MapPin className="h-5 w-5 text-brand" />
              {t.facilities.mapTitle}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.facilities.mapSub}</p>
          </div>
        </div>

        <div className="h-[380px] w-full overflow-hidden rounded-2xl ring-1 ring-slate-200 md:h-[440px]">
          <FacilityMap lang={lang} />
        </div>

        {/* Type legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.facilities.legendTitle}
          </span>
          {LEVEL_ORDER.map((level) => (
            <span
              key={level}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: LEVEL_COLORS[level] }}
              />
              {t.levels[level]}
            </span>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="mt-8 ds-panel p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              <Hospital className="h-5 w-5 text-status-safe" />
              {t.facilities.tableTitle}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.triage.bedsAvailable}:
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${BED_STATUS_DOTS.good}`} />
                {t.facilities.legendGood}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${BED_STATUS_DOTS.fair}`} />
                {t.facilities.legendFair}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${BED_STATUS_DOTS.low}`} />
                {t.facilities.legendLow}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.facilities.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2.5 font-bold">{t.facilities.colName}</th>
                <th className="px-3 py-2.5 font-bold">{t.facilities.colType}</th>
                <th className="px-3 py-2.5 text-center font-bold">
                  {t.facilities.colDoctors}
                </th>
                <th className="px-3 py-2.5 text-center font-bold">
                  {t.facilities.colBeds}
                </th>
                <th className="px-3 py-2.5 font-bold">{t.facilities.colMedicines}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((facility) => {
                const overall = {
                  total: totalBeds(facility),
                  available: availableBeds(facility),
                };
                const free = freePercent(overall) ?? 0;
                const status = bedStatusKey(free);
                const color = LEVEL_COLORS[facility.level];
                const extraMedicines = Math.max(0, facility.medicines.length - 2);
                return (
                  <tr
                    key={facility.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-brand-tint/40"
                  >
                    <td className="px-3 py-3.5">
                      <p className="font-extrabold text-slate-800">{facility.name}</p>
                      <p className="text-xs text-slate-400">{facility.district} · Maharashtra</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {t.levels[facility.level]}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="font-extrabold text-slate-700">
                        {facility.doctorCount}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-flex flex-col rounded-xl px-3 py-1.5 ring-1 ${BED_STATUS_STYLES[status]}`}
                      >
                        <span className="text-sm font-extrabold leading-tight">
                          {free}% {t.facilities.bedsFree}
                        </span>
                        <span className="text-[11px] font-semibold opacity-70">
                          {availableBeds(facility)}/{totalBeds(facility)}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex max-w-[240px] flex-wrap gap-1">
                        {facility.medicines.slice(0, 2).map((medicine) => (
                          <span
                            key={medicine.name}
                            title={`${medicine.name} — ${medicine.stock} ${medicine.unit}`}
                            className="max-w-[150px] truncate rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                          >
                            {medicine.name}
                          </span>
                        ))}
                        {extraMedicines > 0 && (
                          <span
                            title={`+${extraMedicines} more medicines`}
                            className="rounded-md bg-brand-tint px-2 py-0.5 text-[11px] font-extrabold text-brand"
                          >
                            +{extraMedicines}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-400">
                      {t.facilities.noResults}
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
