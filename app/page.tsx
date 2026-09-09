import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
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
      {/* Hero — flat brand-tint band, no gradient, no blobs. */}
      <section className="border-b border-line bg-brand-tint">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-20">
          {/* Plain eyebrow text — deliberately unstyled (no badge look). */}
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
            {t.heroBadge}
          </p>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink-strong md:text-6xl">
            {t.appName}
            <span className="mt-2 block text-2xl font-bold text-brand md:text-4xl">
              {t.appNameRoman}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-ink-mute md:text-lg">
            {t.appNameRoman} — {t.tagline}
          </p>

          {/* Primary CTA + subtle staff link */}
          <HomeCta lang={lang} />

          {/* Live stats from the appointment store */}
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
          <h2 className="text-2xl font-extrabold tracking-tight text-ink-strong md:text-3xl">
            {t.howItWorks.title}
          </h2>
          <p className="mt-2 text-sm text-ink-mute md:text-base">
            {t.howItWorks.sub}
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="ds-panel p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-extrabold text-ink-faint">
                    {lang === "hi" ? "चरण" : "Step"} {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-ink-strong">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-mute">
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
            <h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-ink-strong md:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand">
                <Hospital className="h-5 w-5" />
              </span>
              {t.networkCoverage}
            </h2>
            <p className="mt-1.5 text-sm text-ink-mute">
              {t.networkCoverageSub} · {networkAvailableBeds}/{networkTotalBeds} {t.stats.availableBeds}
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <div key={facility.id} className="ds-panel flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  <BedDouble className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-panel-2 px-2.5 py-1 text-[11px] font-bold text-ink-mute">
                  {t.levels[facility.level]}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold tracking-tight text-ink-strong">
                {facility.name}
              </h3>
              <p className="mt-0.5 text-xs text-ink-mute">
                {facility.district} · Maharashtra
              </p>
              <p className="mt-3 text-xs font-semibold text-ink-mute">
                <span className="text-sm font-extrabold text-ink-strong">
                  {availableBeds(facility)}
                </span>
                /{totalBeds(facility)} {t.stats.availableBeds}
              </p>
              <Link
                href="/facilities"
                className="ds-btn ds-btn-secondary mt-4 min-h-11 text-sm"
              >
                {lang === "hi" ? "विवरण देखें" : "View Details"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-6 text-center text-xs font-medium text-ink-mute">
        {t.footer}
      </footer>
    </div>
  );
}
