import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Building2,
  HeartPulse,
} from "lucide-react";

import { availableBeds, facilities, totalBeds } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { getTranslations } from "@/lib/translations";

export default function HomePage() {
  const t = getTranslations(getLang());

  const networkTotalBeds = facilities.reduce((sum, f) => sum + totalBeds(f), 0);
  const networkAvailableBeds = facilities.reduce((sum, f) => sum + availableBeds(f), 0);
  const totalDoctors = facilities.reduce((sum, f) => sum + f.doctorCount, 0);

  const stats = [
    { value: String(facilities.length), label: t.stats.facilities },
    { value: String(networkTotalBeds), label: t.stats.beds },
    { value: String(networkAvailableBeds), label: t.stats.availableBeds },
    { value: String(totalDoctors), label: t.stats.doctors },
  ];

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-800 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-50">
            <HeartPulse className="h-4 w-4 text-emerald-300" />
            {t.heroBadge}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            {t.appName}
          </h1>
          <p className="mt-3 text-lg font-semibold text-blue-100 md:text-2xl">
            {t.appNameRoman} <span className="mx-1 text-emerald-300">·</span> Health Bridge
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-blue-100/90 md:text-lg">
            {t.tagline}
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-400 md:text-lg"
          >
            {t.getStarted}
            <ArrowRight className="h-5 w-5" />
          </Link>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur"
              >
                <p className="text-2xl font-extrabold md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network coverage */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 md:text-xl">
                {t.networkCoverage}
              </h2>
              <p className="text-sm text-slate-500">{t.networkCoverageSub}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {facility.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.levels[facility.level]} · {facility.district}
                  </p>
                </div>
                <span
                  title={`${t.stats.availableBeds}: ${availableBeds(facility)} / ${totalBeds(facility)}`}
                  className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                >
                  {availableBeds(facility)}/{totalBeds(facility)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        {t.footer}
      </footer>
    </div>
  );
}