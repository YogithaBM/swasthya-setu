"use client";

import { useEffect, useState } from "react";

import { Building2, CalendarDays, Users } from "lucide-react";

import { getStoredAppointments, localToday } from "@/lib/appointments";

interface HomeStatsProps {
  facilityCount: number;
  labels: {
    facilities: string;
    patientsServed: string;
    appointmentsToday: string;
  };
}

/**
 * Live network stats for the homepage hero, recomputed from the shared
 * appointment store on every mount — so returning to the homepage after a
 * booking shows fresh numbers (plus focus/visibility re-reads).
 *
 * - facilities: static count from lib/data.
 * - patientsServed: unique phone numbers across ALL stored appointments.
 * - appointmentsToday: appointments whose booking date is today.
 */
export default function HomeStats({ facilityCount, labels }: HomeStatsProps) {
  const [stats, setStats] = useState({ patientsServed: 0, appointmentsToday: 0 });

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

  const cards = [
    { icon: Building2, value: facilityCount, label: labels.facilities },
    { icon: Users, value: stats.patientsServed, label: labels.patientsServed },
    { icon: CalendarDays, value: stats.appointmentsToday, label: labels.appointmentsToday },
  ];

  return (
    <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="ds-panel px-4 py-5 text-center">
            <div className="flex items-center justify-center gap-3">
              <Icon className="h-6 w-6 text-brand" />
              <p className="text-3xl font-extrabold text-ink-strong">{card.value}</p>
            </div>
            <p className="mt-1 text-xs font-medium text-ink-mute">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
