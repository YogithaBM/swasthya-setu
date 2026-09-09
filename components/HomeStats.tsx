"use client";

import { useEffect, useRef, useState } from "react";

import { Building2, CalendarDays, Users } from "lucide-react";

import CountUp from "@/components/CountUp";
import { getStoredAppointments, localToday } from "@/lib/appointments";

interface HomeStatsProps {
  facilityCount: number;
  labels: {
    facilities: string;
    patientsServed: string;
    appointmentsToday: string;
  };
}

/** Reveal-on-scroll: cards start shifted down + transparent, then rise in. */
const CARD_CLASS =
  "stat-card ds-panel px-4 py-5 text-center opacity-0 translate-y-4 " +
  "transition-[opacity,transform] duration-500 ease-out";

/**
 * Live network stats for the homepage hero, recomputed from the shared
 * appointment store on every mount — so returning to the homepage after a
 * booking shows fresh numbers (plus focus/visibility re-reads).
 *
 * - facilities: static count from lib/data.
 * - patientsServed: unique phone numbers across ALL stored appointments.
 * - appointmentsToday: appointments whose booking date is today.
 *
 * Numbers count up from 0 and cards fade/slide in with a 100 ms stagger
 * when they enter the viewport.
 */
export default function HomeStats({ facilityCount, labels }: HomeStatsProps) {
  const [stats, setStats] = useState({ patientsServed: 0, appointmentsToday: 0 });
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function recompute() {
      const appointments = getStoredAppointments();
      const today = localToday();

      const phones = new Set(
        appointments
          .map((appointment) => appointment.phone ?? "")
          .filter((phone) => phone.length > 0)
      );

      const todays = appointments.filter(
        (appointment) => appointment.date === today
      ).length;

      setStats({ patientsServed: phones.size, appointmentsToday: todays });
    }

    recompute();

    // Re-read when the tab regains focus or becomes visible again — covers
    // navigating back to the homepage right after booking.
    window.addEventListener("focus", recompute);
    document.addEventListener("visibilitychange", recompute);
    return () => {
      window.removeEventListener("focus", recompute);
      document.removeEventListener("visibilitychange", recompute);
    };
  }, []);

  // Staggered reveal: each card becomes visible 100 ms after the previous.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(".stat-card"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => {
        card.classList.add("!opacity-100", "!translate-y-0");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = cards.indexOf(entry.target as HTMLElement);
          window.setTimeout(() => {
            entry.target.classList.add("!opacity-100", "!translate-y-0");
          }, Math.max(0, index) * 100);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const cards = [
    { icon: Building2, value: facilityCount, label: labels.facilities },
    {
      icon: Users,
      value: stats.patientsServed,
      label: labels.patientsServed,
    },
    {
      icon: CalendarDays,
      value: stats.appointmentsToday,
      label: labels.appointmentsToday,
    },
  ];

  return (
    <div
      ref={gridRef}
      className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={CARD_CLASS}>
            <div className="flex items-center justify-center gap-3">
              <Icon className="h-6 w-6 text-brand" />
              <p className="text-3xl font-extrabold text-ink-strong">
                <CountUp end={card.value} duration={1200} />
              </p>
            </div>
            <p className="mt-1 text-xs font-medium text-ink-mute">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
