"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  FileText,
  FlaskConical,
  Microscope,
  Search,
  User,
} from "lucide-react";

import { getAshaPatients } from "@/lib/ashaPatients";
import { getFacilityById } from "@/lib/data";
import { getEmergenciesByPhone, type Emergency } from "@/lib/emergencies";
import {
  getAppointments,
  type StoredAppointment,
} from "@/lib/appointments";
import { getLabOrdersByPhone, type LabOrder } from "@/lib/labOrders";
import {
  getPatientRecords,
  type PatientRecord,
} from "@/lib/patientRecords";
import { getReferrals, type Referral } from "@/lib/referrals";
import { getFollowups, type Followup } from "@/lib/followups";
import { SEVERITY_EMOJI, SEVERITY_LABELS } from "@/lib/triage";
import { getTranslations, translations, type Language } from "@/lib/translations";

const SEVERITY_CHIP_STYLES: Record<PatientRecord["severity"], string> = {
  red: "bg-red-50 text-red-700 ring-red-200",
  yellow: "bg-amber-50 text-amber-800 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

/** Local YYYY-MM-DD for "upcoming" filtering. */
function todayStr(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Pull a phone number out of an arbitrary record object. Datasets name the
 * field differently ("phone", "mobile", "patientPhone", "phoneNumber",
 * "contact") — check every known variant, plus a value scan fallback.
 */
function phoneOf(record: Record<string, unknown>): string {
  const keys = ["phone", "mobile", "patientPhone", "phoneNumber", "contact", "mobileNumber"];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.replace(/\D/g, "");
    if (typeof value === "number") return String(value);
  }
  // Fallback: any string field that looks like a 10-digit Indian mobile.
  for (const value of Object.values(record)) {
    if (typeof value === "string" && /^[6-9]\d{9}$/.test(value.trim())) {
      return value.replace(/\D/g, "");
    }
  }
  return "";
}

/** Generic records for a phone from any store array. */
function recordsForPhone<T>(store: T[], phone: string): T[] {
  return store.filter(
    (record) =>
      typeof record === "object" &&
      record !== null &&
      phoneOf(record as Record<string, unknown>) === phone
  );
}

export default function MyRecordsClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].myRecords.title;

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Data for the searched phone.
  const [patientName, setPatientName] = useState("");
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [history, setHistory] = useState<PatientRecord[]>([]);
  const [labs, setLabs] = useState<LabOrder[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  function handleSearch() {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setPhoneError(
        lang === "hi"
          ? "10 अंकों का मोबाइल नंबर डालें।"
          : "Enter a 10-digit mobile number."
      );
      return;
    }
    setPhoneError(null);
    setSearched(true);

    // Search EVERY store for this phone — each dataset may name the
    // phone field differently, so recordsForPhone checks all variants.
    const allAppointments = getAppointments();
    const myAppointments = recordsForPhone(allAppointments, cleaned);
    const myRecords = getPatientRecords()
      .filter((record) => record.phone === cleaned || phoneOf(record as unknown as Record<string, unknown>) === cleaned)
      .sort((a, b) => b.date.localeCompare(a.date));
    const myLabs = getLabOrdersByPhone(cleaned).length
      ? getLabOrdersByPhone(cleaned)
      : recordsForPhone(getLabOrdersByPhoneAny(cleaned), cleaned).length
        ? recordsForPhone(getLabOrdersByPhoneAny(cleaned), cleaned)
        : [];
    const myReferrals = recordsForPhone(getReferrals(), cleaned);
    const myFollowups = recordsForPhone(getFollowups(), cleaned);
    const myEmergencies = getEmergenciesByPhone(cleaned).length
      ? getEmergenciesByPhone(cleaned)
      : recordsForPhone(getEmergenciesAny(), cleaned);

    // Referrals/follow-ups may not carry a phone at all — fall back to
    // matching their patient name against phone-linked records.
    const linkedNames = new Set<string>([
      ...myRecords.map((record) => record.patientName.trim().toLowerCase()),
      ...myAppointments.map((appointment) => appointment.patientName.trim().toLowerCase()),
    ]);
    const nameKnown = (candidate: string) =>
      linkedNames.has(candidate.trim().toLowerCase());
    const resolvedReferrals = myReferrals.length
      ? myReferrals
      : getReferrals().filter((referral) => nameKnown(referral.patientName));
    const resolvedFollowups = myFollowups.length
      ? myFollowups
      : getFollowups().filter((followup) => nameKnown(followup.patientName));

    // Resolve a display name from whichever store knows this phone.
    const ashaName =
      getAshaPatients().find((patient) => patient.phone === cleaned)?.name ?? "";
    const appointmentName = myAppointments[0]?.patientName ?? "";
    const recordName = myRecords[0]?.patientName ?? "";

    setAppointments(myAppointments);
    setHistory(myRecords);
    setLabs(myLabs);
    setReferrals(resolvedReferrals);
    setFollowups(resolvedFollowups);
    setEmergencies(myEmergencies);
    setPatientName(recordName || appointmentName || ashaName);
  }

  /** Full lab-order store read (for the phone-variant fallback). */
  function getLabOrdersByPhoneAny(_phone: string): LabOrder[] {
    // getLabOrdersByPhone already covers "phone"; this re-reads the raw
    // store so recordsForPhone can check mobile/patientPhone variants.
    const raw = window.localStorage.getItem("swasthya_lab_orders");
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as LabOrder[]) : [];
    } catch {
      return [];
    }
  }

  /** Full emergency store read (for the phone-variant fallback). */
  function getEmergenciesAny(): Emergency[] {
    const raw = window.localStorage.getItem("swasthya_emergencies");
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Emergency[]) : [];
    } catch {
      return [];
    }
  }

  function formatLongDate(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(
      lang === "hi" ? "hi-IN" : "en-IN",
      { day: "numeric", month: "long", year: "numeric" }
    );
  }

  const upcomingFollowups = followups
    .filter((followup) => followup.followUpDate >= todayStr())
    .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  const activeReferrals = referrals.filter(
    (referral) => referral.status !== "Completed"
  );
  const pendingLabs = labs.filter((order) => order.status === "Pending");
  const hasAnyData =
    appointments.length > 0 ||
    history.length > 0 ||
    labs.length > 0 ||
    activeReferrals.length > 0 ||
    upcomingFollowups.length > 0 ||
    emergencies.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      {/* Toast for validation errors */}
      {phoneError && (
        <div
          role="alert"
          className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 glass-toast rounded-xl px-4 py-3 text-center text-sm font-extrabold text-red-600 dark:text-red-400"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {phoneError}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
          <FileText className="h-4 w-4" />
          {t.myRecords.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.myRecords.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-blue-800 md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.myRecords.description}
        </p>
      </div>

      {/* Phone lookup card */}
      <div className="mt-8 glass-card p-6 md:p-8">
        <label className="block">
          <span className="text-sm font-bold text-slate-600">
            {t.myRecords.phoneLabel}
          </span>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder={t.myRecords.phonePlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold tracking-wide text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={phone.length !== 10}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-800/25 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {t.myRecords.findRecords}
            </button>
          </div>
        </label>
        <p className="mt-3 text-xs font-semibold text-slate-400">{t.myRecords.note}</p>
      </div>

      {/* No records found */}
      {searched && !hasAnyData && (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
          <User className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-400">
            {t.myRecords.notFound}
          </p>
        </div>
      )}

      {/* Results */}
      {searched && hasAnyData && (
        <div className="mt-6 space-y-6">
          {patientName && (
            <p className="text-center text-sm font-extrabold text-slate-700">
              👤 {patientName} · 📞 {phone}
            </p>
          )}

          {/* Appointments */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-700" />
              <h2 className="text-sm font-extrabold text-slate-800">
                {t.myRecords.appointmentsSection}
              </h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-800 ring-1 ring-blue-200">
                {appointments.length}
              </span>
            </div>
            {appointments.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {t.myRecords.noAppointments}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {appointments.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50/60 px-4 py-3 ring-1 ring-blue-100"
                  >
                    <CalendarDays className="h-4 w-4 shrink-0 text-blue-700" />
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatLongDate(appointment.date)} · {appointment.time}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {getFacilityById(appointment.facility)?.name ?? appointment.facility}
                    </span>
                    <span className="rounded-lg bg-blue-50 px-1.5 py-0.5 text-xs font-black text-blue-800 ring-1 ring-blue-200">
                      #{appointment.queueNumber}
                    </span>
                    <span
                      className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ring-1 ${
                        appointment.status === "Waiting"
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      }`}
                    >
                      {appointment.status === "Waiting"
                        ? t.appointments.statusWaiting
                        : t.appointments.statusCompleted}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Past visits + prescriptions */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-700" />
              <h2 className="text-sm font-extrabold text-slate-800">
                {t.myRecords.visitsSection}
              </h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-800 ring-1 ring-blue-200">
                {history.length}
              </span>
            </div>
            {history.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {t.myRecords.noVisits}
              </p>
            ) : (
              <ol className="mt-4 space-y-3">
                {history.map((record, index) => (
                  <li
                    key={record.id}
                    className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-black text-blue-800">
                          {history.length - index}
                        </span>
                        {formatLongDate(record.date)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${SEVERITY_CHIP_STYLES[record.severity]}`}
                      >
                        {SEVERITY_EMOJI[record.severity]}{" "}
                        {SEVERITY_LABELS[record.severity][lang]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      {record.diagnosis}
                    </p>
                    {record.medicines.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {record.medicines.map((medicine, medicineIndex) => (
                          <span
                            key={medicineIndex}
                            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200"
                          >
                            💊 {medicine.name} · {medicine.dosage}
                          </span>
                        ))}
                      </div>
                    )}
                    {record.doctorNotes && (
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {record.doctorNotes}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Upcoming follow-ups */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-blue-700" />
              <h2 className="text-sm font-extrabold text-slate-800">
                {t.myRecords.followupsSection}
              </h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-800 ring-1 ring-blue-200">
                {upcomingFollowups.length}
              </span>
            </div>
            {upcomingFollowups.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {t.myRecords.noFollowups}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {upcomingFollowups.map((followup) => (
                  <li
                    key={followup.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50/60 px-4 py-3 ring-1 ring-blue-100"
                  >
                    <CalendarClock className="h-4 w-4 shrink-0 text-blue-700" />
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatLongDate(followup.followUpDate)}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {followup.diagnosis}
                    </span>
                    <span className="ml-auto text-xs font-bold text-slate-500">
                      {getFacilityById(followup.facility)?.name ?? followup.facility}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Lab tests */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-sky-700" />
              <h2 className="text-sm font-extrabold text-slate-800">
                {t.myRecords.labsSection}
              </h2>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-black text-sky-800 ring-1 ring-sky-200">
                {labs.length}
              </span>
              {pendingLabs.length > 0 && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-800 ring-1 ring-amber-200">
                  {pendingLabs.length} {t.myRecords.labStatusPending}
                </span>
              )}
            </div>
            {labs.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {t.myRecords.noLabs}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {labs.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-sky-50/60 px-4 py-3 ring-1 ring-sky-100"
                  >
                    <FlaskConical className="h-4 w-4 shrink-0 text-sky-700" />
                    <span className="text-sm font-extrabold text-slate-800">
                      {order.testName}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${
                        order.status === "Pending"
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      }`}
                    >
                      {order.status === "Pending"
                        ? t.myRecords.labStatusPending
                        : t.myRecords.labStatusCompleted}
                    </span>
                    {order.result && (
                      <span className="text-xs font-semibold text-slate-600">
                        {order.result}
                      </span>
                    )}
                    <span className="ml-auto text-xs font-bold text-slate-500">
                      {formatLongDate(order.dateOrdered)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Active referrals */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-red-600" />
              <h2 className="text-sm font-extrabold text-slate-800">
                {t.myRecords.referralsSection}
              </h2>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-700 ring-1 ring-red-200">
                {activeReferrals.length}
              </span>
            </div>
            {activeReferrals.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {t.myRecords.noReferrals}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {activeReferrals.map((referral) => (
                  <li
                    key={referral.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50/60 px-4 py-3 ring-1 ring-red-100"
                  >
                    <ArrowLeftRight className="h-4 w-4 shrink-0 text-red-600" />
                    <span className="text-sm font-extrabold text-slate-800">
                      {getFacilityById(referral.fromFacility)?.name ?? referral.fromFacility}
                      {" → "}
                      {getFacilityById(referral.toFacility)?.name ?? referral.toFacility}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${
                        referral.status === "Pending"
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-sky-50 text-sky-800 ring-sky-200"
                      }`}
                    >
                      {referral.status}
                    </span>
                    <span className="ml-auto text-xs font-bold text-slate-500">
                      {formatLongDate(referral.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Emergency escalations */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">🚨</span>
              <h2 className="text-sm font-extrabold text-slate-800">
                {t.myRecords.emergenciesSection}
              </h2>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-700 ring-1 ring-red-200">
                {emergencies.length}
              </span>
            </div>
            {emergencies.length === 0 ? (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {t.myRecords.noEmergencies}
              </p>
            ) : (
              <ul className="mt-4 space-y-1.5">
                {emergencies.map((emergency) => (
                  <li
                    key={emergency.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50/60 px-4 py-2.5 ring-1 ring-red-100"
                  >
                    <span className="text-xs font-bold text-red-700">
                      {new Date(emergency.timestamp).toLocaleString(
                        lang === "hi" ? "hi-IN" : "en-IN"
                      )}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {emergency.symptoms}
                    </span>
                    <span
                      className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${
                        emergency.status === "escalated"
                          ? "bg-red-50 text-red-700 ring-red-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      }`}
                    >
                      {emergency.status === "escalated"
                        ? t.escalation.statusEscalated
                        : t.escalation.statusResolved}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
