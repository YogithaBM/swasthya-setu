"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CalendarPlus, Stethoscope } from "lucide-react";

import { clearRole, setRole } from "@/lib/auth";
import { getTranslations, type Language } from "@/lib/translations";

/**
 * Landing-page CTA pair. "Book Appointment" fast-tracks visitors into the
 * patient flow (role stored, no login screen); "Staff Login" leads to the
 * role-selection page for doctors/ASHA workers who need a PIN.
 */
export default function HomeCta({ lang }: { lang: Language }) {
  const router = useRouter();
  const t = getTranslations(lang);

  function bookAppointment() {
    // Patients skip login entirely — the app infers their role directly.
    setRole("patient");
    router.push("/appointments");
  }

  function staffLogin() {
    // Role-switch entry point: drop the current role so /login renders
    // (AppShell otherwise bounces logged-in users back to their home).
    clearRole();
    router.push("/login");
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={bookAppointment}
        className="btn-primary inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-extrabold md:text-lg"
      >
        <CalendarPlus className="h-5 w-5" />
        {t.bookAppointmentCta}
        <ArrowRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={staffLogin}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-100/85 underline-offset-4 transition hover:text-white hover:underline"
      >
        <Stethoscope className="h-4 w-4" />
        {t.staffLoginLink}
      </button>
    </div>
  );
}
