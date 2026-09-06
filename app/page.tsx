import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  HeartPulse,
  Stethoscope,
  Users,
} from "lucide-react";

import { availableBeds, facilities, totalBeds } from "@/lib/data";
import { getAppointments } from "@/lib/appointments";
import { getLang } from "@/lib/lang";
import { getTranslations } from "@/lib/translations";

export default function HomePage() {
  const lang = getLang();
  const t = getTranslations(lang);

  const networkTotalBeds = facilities.reduce((sum, f) => sum + totalBeds(f), 0);
  const networkAvailableBeds = facilities.reduce((sum, f) => sum + availableBeds(f), 0);
  const todayStr = new Date().toLocaleDateString("en-CA");
  const appointmentsToday = getAppointments().filter(
    (appointment) => !appointment.date || appointment.date === todayStr
  ).length;
  const patientsServed = 247;

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white">
        {/* Soft mesh blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl"
        />
        {/* Faint medical-cross watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[8%] top-1/2 -translate-y-1/2 select-none font-black text-white/[0.06]"
          style={{ fontSize: "22rem", lineHeight: 1 }}
        >
          ✚
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-50 backdrop-blur">
            <HeartPulse className="h-4 w-4 text-teal-300" />
            {t.heroBadge}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            {t.appName}
            <span className="mt-2 block text-2xl font-bold text-teal-100 md:text-4xl">
              {t.appNameRoman} — ग्रामीण स्वास्थ्य सेतु
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal text-teal-50/85 md:text-lg">
            {t.tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-teal-950/40 transition hover:-translate-y-0.5 hover:brightness-105 md:text-lg"
            >
              <Stethoscope className="h-5 w-5" />
              {lang === "hi" ? "मैं मरीज़ हूँ" : "I am a Patient"}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-300/80 bg-white/5 px-8 py-4 text-base font-extrabold text-teal-50 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 md:text-lg"
            >
              <Users className="h-5 w-5" />
              {lang === "hi" ? "मैं डॉक्टर हूँ" : "I am a Doctor"}
            </Link>
          </div>

          {/* Glass stat cards */}
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
            <div className="glass-card lift-hover px-4 py-5 text-slate-100 dark:text-slate-100" style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
              <div className="flex items-center justify-center gap-3">
                <Building2 className="h-6 w-6 text-teal-300" />
                <p className="text-3xl font-extrabold">{facilities.length}</p>
              </div>
              <p className="mt-1 text-xs font-medium text-teal-50/85">{t.stats.facilities}</p>
            </div>
            <div className="glass-card lift-hover px-4 py-5 text-slate-100 dark:text-slate-100" style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
              <div className="flex items-center justify-center gap-3">
                <Users className="h-6 w-6 text-teal-300" />
                <p className="text-3xl font-extrabold">{patientsServed}</p>
              </div>
              <p className="mt-1 text-xs font-medium text-teal-50/85">{t.stats.patientsServed}</p>
            </div>
            <div className="glass-card lift-hover px-4 py-5 text-slate-100 dark:text-slate-100" style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
              <div className="flex items-center justify-center gap-3">
                <CalendarDays className="h-6 w-6 text-teal-300" />
                <p className="text-3xl font-extrabold">{appointmentsToday}</p>
              </div>
              <p className="mt-1 text-xs font-medium text-teal-50/85">{t.stats.appointmentsToday}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Network coverage */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-xl">
                {t.networkCoverage}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.networkCoverageSub}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="surface-soft lift-hover flex items-center gap-3 rounded-2xl p-4 ring-1 ring-slate-900/5 dark:ring-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-300">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {facility.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.levels[facility.level]} · {facility.district}
                  </p>
                </div>
                <span
                  title={`${t.stats.availableBeds}: ${availableBeds(facility)} / ${totalBeds(facility)}`}
                  className="ml-auto shrink-0 rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300"
                >
                  {availableBeds(facility)}/{totalBeds(facility)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900/10 py-6 text-center text-xs font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
        {t.footer}
      </footer>
    </div>
  );
}
