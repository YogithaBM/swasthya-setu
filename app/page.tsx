import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  HeartPulse,
  Hospital,
  MessagesSquare,
  Ticket,
  Users,
} from "lucide-react";

import HomeCta from "@/components/HomeCta";
import HomeStats from "@/components/HomeStats";
import { availableBeds, facilities, totalBeds } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { getTranslations } from "@/lib/translations";

export default function HomePage() {
  const lang = getLang();
  const t = getTranslations(lang);

  const networkTotalBeds = facilities.reduce((sum, f) => sum + totalBeds(f), 0);
  const networkAvailableBeds = facilities.reduce((sum, f) => sum + availableBeds(f), 0);

  const steps = [
    { icon: MessagesSquare, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { icon: BedDouble, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { icon: Ticket, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
  ];

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
              {t.appNameRoman}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal text-teal-50/85 md:text-lg">
            {t.appNameRoman} — {t.tagline}
          </p>

          {/* Primary CTA + subtle staff link */}
          <HomeCta lang={lang} />

          {/* Glass stat cards — live from the appointment store */}
          <HomeStats
            facilityCount={facilities.length}
            labels={{
              facilities: t.stats.facilities,
              patientsServed: t.stats.patientsServed,
              appointmentsToday: t.stats.appointmentsToday,
            }}
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-5xl px-6 pt-14">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
            {t.howItWorks.title}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 md:text-base">
            {t.howItWorks.sub}
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="glass-card lift-hover relative p-6">
                <span className="absolute right-5 top-4 text-4xl font-black text-teal-500/15 dark:text-teal-300/15">
                  {index + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Our Facilities */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
                <Hospital className="h-5 w-5" />
              </span>
              {t.networkCoverage}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {t.networkCoverageSub} · {networkAvailableBeds}/{networkTotalBeds} {t.stats.availableBeds}
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <div key={facility.id} className="glass-card lift-hover flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
                  <BedDouble className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                  {t.levels[facility.level]}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {facility.name}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {facility.district} · Maharashtra
              </p>
              <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {availableBeds(facility)}
                </span>
                /{totalBeds(facility)} {t.stats.availableBeds}
              </p>
              <Link
                href="/facilities"
                className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-teal-600 underline-offset-4 transition hover:text-teal-700 hover:underline dark:text-teal-300 dark:hover:text-teal-200"
              >
                {lang === "hi" ? "विवरण देखें" : "View Details"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-900/10 py-6 text-center text-xs font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
        {t.footer}
      </footer>
    </div>
  );
}
