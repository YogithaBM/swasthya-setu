"use client";

import { useEffect, useState } from "react";

import { Building2, CalendarDays, Users } from "lucide-react";

import { getAppointments, localToday } from "@/lib/appointments";

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
      const appointments = getAppointments();
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

  const cardClass =
    "glass-card lift-hover px-4 py-5 text-slate-100 dark:text-slate-100";

  return (
    <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
      <div className={cardClass} style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
        <div className="flex items-center justify-center gap-3">
          <Building2 className="h-6 w-6 text-teal-300" />
          <p className="text-3xl font-extrabold">{facilityCount}</p>
        </div>
        <p className="mt-1 text-xs font-medium text-teal-50/85">{labels.facilities}</p>
      </div>
      <div className={cardClass} style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
        <div className="flex items-center justify-center gap-3">
          <Users className="h-6 w-6 text-teal-300" />
          <p className="text-3xl font-extrabold">{stats.patientsServed}</p>
        </div>
        <p className="mt-1 text-xs font-medium text-teal-50/85">{labels.patientsServed}</p>
      </div>
      <div className={cardClass} style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}>
        <div className="flex items-center justify-center gap-3">
          <CalendarDays className="h-6 w-6 text-teal-300" />
          <p className="text-3xl font-extrabold">{stats.appointmentsToday}</p>
        </div>
        <p className="mt-1 text-xs font-medium text-teal-50/85">{labels.appointmentsToday}</p>
      </div>
    </div>
  );
}
