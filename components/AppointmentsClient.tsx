"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Hospital,
  Phone,
  Ticket,
  User,
  Users,
} from "lucide-react";

import {
  addAppointment,
  getStoredAppointments,
  localToday,
  type AppointmentStatus,
  type StoredAppointment,
} from "@/lib/appointments";
import { facilities } from "@/lib/data";
import { getTranslations, translations, type Language } from "@/lib/translations";

type FilterKey = "all" | "Waiting" | "Completed";
type FieldKey = "facility" | "date" | "time" | "name" | "phone";

interface Confirmation {
  patientName: string;
  facilityId: string;
  date: string;
  time: string;
  queue: number;
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  Waiting: "bg-status-attention-tint text-status-attention ring-amber-200",
  Completed: "bg-status-safe-tint text-status-safe ring-emerald-200",
};

/** Latin + Devanagari letters, spaces and basic punctuation. */
const NAME_REGEX = /^[A-Za-z\u0900-\u097F\s.'\-()/]+$/;

/** 9:00 AM – 5:00 PM in 30-minute increments (16 slots). */
const TIME_SLOTS: { value: string; label: string }[] = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let hour = 9; hour <= 16; hour += 1) {
    for (const minute of [0, 30] as const) {
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      slots.push({
        value: `${String(hour).padStart(2, "0")}:${minute === 0 ? "00" : "30"}`,
        label: `${hour12}:${minute === 0 ? "00" : "30"} ${period}`,
      });
    }
  }
  return slots;
})();

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface FormValues {
  facilityId: string;
  date: string;
  time: string;
  patientName: string;
  phone: string;
}

export default function AppointmentsClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].appointments.title;

  const todayStr = useMemo(() => localDateString(new Date()), []);
  const maxDateStr = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return localDateString(date);
  }, []);

  const [facilityId, setFacilityId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    facility: false,
    date: false,
    time: false,
    name: false,
    phone: false,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  /** Today's REAL bookings from localStorage — no hardcoded samples. */
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  // Load today's real bookings, and re-read when the tab regains focus so a
  // booking made elsewhere (or completed by the doctor) shows up live.
  useEffect(() => {
    const today = localToday();

    function recompute() {
      setAppointments(
        getStoredAppointments().filter((appointment) => appointment.date === today)
      );
    }

    recompute();
    window.addEventListener("focus", recompute);
    return () => window.removeEventListener("focus", recompute);
  }, []);

  const values: FormValues = { facilityId, date, time, patientName, phone };

  function validateAll(v: FormValues): Partial<Record<FieldKey, string>> {
    const errors: Partial<Record<FieldKey, string>> = {};

    const name = v.patientName.trim();
    if (!name) errors.name = t.appointments.errorName;
    else if (name.length < 3) errors.name = t.appointments.nameMin;
    else if (name.length > 100) errors.name = t.appointments.nameMax;
    else if (!NAME_REGEX.test(name)) errors.name = t.appointments.nameInvalid;

    if (!v.phone) errors.phone = t.appointments.phoneRequired;
    else if (!/^[6-9]\d{9}$/.test(v.phone)) errors.phone = t.appointments.phoneInvalid;

    if (!v.facilityId) errors.facility = t.appointments.errorFacility;
    if (!v.date || v.date < todayStr || v.date > maxDateStr) {
      errors.date = t.appointments.errorDate;
    }
    if (!v.time) errors.time = t.appointments.errorTime;

    return errors;
  }

  const allErrors = useMemo(
    () => validateAll(values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, t, todayStr, maxDateStr]
  );
  const isFormValid = Object.keys(allErrors).length === 0;

  function visibleError(field: FieldKey): string | undefined {
    return touched[field] ? allErrors[field] : undefined;
  }

  function markTouched(field: FieldKey) {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }

  function markAllTouched() {
    setTouched({ facility: true, date: true, time: true, name: true, phone: true });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function handleBook() {
    // Double-validate on submit (button is disabled while invalid, but guard anyway).
    const current: FormValues = { facilityId, date, time, patientName, phone };
    const errors = validateAll(current);
    if (Object.keys(errors).length > 0) {
      markAllTouched();
      showToast(t.appointments.toastError);
      return;
    }

    const name = patientName.trim();
    const queue = Math.floor(Math.random() * 50) + 1;
    const timeLabel = TIME_SLOTS.find((slot) => slot.value === time)?.label ?? time;
    setConfirmation({ patientName: name, facilityId, date, time: timeLabel, queue });

    // Persist to the shared store (synced to the doctor panel).
    const appointment: StoredAppointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      patientName: name,
      facility: facilityId,
      date,
      time: timeLabel,
      phone,
      queueNumber: queue,
      status: "Waiting",
      severity: "yellow",
      symptoms: "",
      isNew: true,
    };
    addAppointment(appointment);

    // Today's bookings appear live at the top of the queue table.
    if (date === todayStr) {
      setAppointments((previous) => [appointment, ...previous]);
    }
  }

  function resetForm() {
    setConfirmation(null);
    setFacilityId("");
    setDate("");
    setTime("");
    setPatientName("");
    setPhone("");
    setTouched({ facility: false, date: false, time: false, name: false, phone: false });
    setToast(null);
  }

  function formatDate(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(
      lang === "hi" ? "hi-IN" : "en-IN",
      { weekday: "short", day: "numeric", month: "short" }
    );
  }

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: t.appointments.filterAll, count: appointments.length },
    {
      key: "Waiting",
      label: t.appointments.statusWaiting,
      count: appointments.filter((a) => a.status === "Waiting").length,
    },
    {
      key: "Completed",
      label: t.appointments.statusCompleted,
      count: appointments.filter((a) => a.status === "Completed").length,
    },
  ];

  const confirmationFacility = confirmation
    ? facilities.find((facility) => facility.id === confirmation.facilityId)
    : undefined;

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((appointment) => appointment.status === filter);

  const fieldError = (field: FieldKey) => {
    const message = visibleError(field);
    return message ? (
      <p
        role="alert"
        className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-status-emergency"
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {message}
      </p>
    ) : null;
  };

  const inputClasses = (field: FieldKey) =>
    `mt-2 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
      visibleError(field)
        ? "border-red-400 bg-status-emergency-tint/50 focus:border-red-500 focus:ring-red-200"
        : "border-slate-200 bg-slate-50 focus:border-blue-700 focus:ring-blue-700/20"
    }`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-extrabold text-white shadow-xl"
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.appointments.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-brand md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.appointments.description}
        </p>
      </div>

      {/* Booking form */}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleBook();
        }}
        className="mt-8 ds-panel p-6 md:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{t.appointments.formTitle}</h2>
            <p className="text-sm text-slate-500">{t.appointments.formSub}</p>
          </div>
        </div>

        {/* Facility */}
        <label className="mt-6 block">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
            <Hospital className="h-4 w-4 text-status-safe" />
            {t.appointments.facilityLabel}
          </span>
          <select
            required
            value={facilityId}
            onChange={(event) => {
              setFacilityId(event.target.value);
              markTouched("facility");
            }}
            onBlur={() => markTouched("facility")}
            className={inputClasses("facility")}
          >
            <option value="">{t.appointments.facilityPlaceholder}</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name} — {t.levels[facility.level]}
              </option>
            ))}
          </select>
          {fieldError("facility")}
        </label>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Date */}
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
              <CalendarDays className="h-4 w-4 text-brand" />
              {t.appointments.dateLabel}
            </span>
            <input
              type="date"
              required
              value={date}
              min={todayStr}
              max={maxDateStr}
              onChange={(event) => {
                setDate(event.target.value);
                markTouched("date");
              }}
              onBlur={() => markTouched("date")}
              className={inputClasses("date")}
            />
            <span className="mt-1 block text-xs text-slate-400">
              {todayStr} – {maxDateStr}
            </span>
            {fieldError("date")}
          </label>

          {/* Patient name */}
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
              <User className="h-4 w-4 text-brand" />
              {t.appointments.nameLabel}
            </span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={patientName}
              onChange={(event) => {
                // Reject numbers as the user types.
                setPatientName(event.target.value.replace(/\d/g, ""));
                markTouched("name");
              }}
              onBlur={() => markTouched("name")}
              placeholder={t.appointments.namePlaceholder}
              className={inputClasses("name")}
            />
            {fieldError("name")}
          </label>
        </div>

        {/* Phone */}
        <label className="mt-5 block">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
            <Phone className="h-4 w-4 text-status-safe" />
            {t.appointments.phoneLabel}
          </span>
          <input
            type="tel"
            inputMode="numeric"
            required
            pattern="[6-9][0-9]{9}"
            value={phone}
            onChange={(event) => {
              // Digits only — no letters, spaces or special chars. No silent
              // truncation: an 11th digit stays in the field and fails the
              // exactly-10 validation below (error + disabled submit).
              setPhone(event.target.value.replace(/\D/g, ""));
              markTouched("phone");
            }}
            onBlur={() => markTouched("phone")}
            placeholder={t.appointments.phonePlaceholder}
            className={`${inputClasses("phone")} sm:max-w-xs`}
          />
          {fieldError("phone")}
        </label>

        {/* Time slots */}
        <div className="mt-6">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
            <Clock className="h-4 w-4 text-brand" />
            {t.appointments.timeLabel}
          </span>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {TIME_SLOTS.map((slot) => {
              const selected = time === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => {
                    setTime(slot.value);
                    markTouched("time");
                  }}
                  className={`rounded-lg px-1 py-2 text-[11px] font-bold transition ${
                    selected
                      ? "bg-brand text-page"
                      : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-brand-tint hover:text-brand hover:ring-blue-200"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
          {fieldError("time")}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-extrabold transition sm:w-auto ${
            isFormValid
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          <CalendarPlus className="h-5 w-5" />
          {t.appointments.bookButton}
        </button>
        {!isFormValid && (
          <p className="mt-3 text-xs font-semibold text-slate-400">
            {t.appointments.toastError}
          </p>
        )}
      </form>

      {/* Confirmation */}
      {confirmation && confirmationFacility && (
        <div className="mt-6 ds-panel border-2 border-status-safe bg-status-safe-tint p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-status-safe-tint text-status-safe">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-status-safe">
                {t.appointments.confirmationTitle}
              </h2>
              <p className="text-sm text-status-safe">{t.appointments.confirmationSub}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Ticket className="h-3.5 w-3.5" />
              {t.appointments.colQueue}
            </span>
            <p className="text-6xl font-black leading-none text-brand">
              {confirmation.queue}
            </p>
            <p className="text-sm font-bold text-status-safe">
              {t.appointments.queueMessage.replace("{n}", String(confirmation.queue))}
            </p>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.appointments.facilityLabel}
              </p>
              <p className="mt-0.5 truncate text-sm font-extrabold text-slate-800">
                {confirmationFacility.name}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.appointments.selectedDate}
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-slate-800">
                {formatDate(confirmation.date)}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.appointments.selectedTime}
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-slate-800">
                {confirmation.time}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.appointments.waitTime}
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-brand">
                {t.appointments.waitMinutes.replace("{n}", String(confirmation.queue * 5))}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.appointments.nameLabel}
              </p>
              <p className="mt-0.5 truncate text-sm font-extrabold text-slate-800">
                {confirmation.patientName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-status-safe ring-1 ring-emerald-300 transition hover:bg-status-safe-tint"
          >
            <CalendarPlus className="h-4 w-4" />
            {t.appointments.bookAnother}
          </button>
        </div>
      )}

      {/* Today's appointments */}
      <div className="mt-8 ds-panel p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              <Users className="h-5 w-5 text-brand" />
              {t.appointments.todayAppointments}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.appointments.todaySub}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold ring-1 transition ${
                  filter === tab.key
                    ? "bg-brand text-page"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-brand-tint hover:text-brand"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-2.5 font-bold">{t.appointments.colPatient}</th>
                <th className="px-3 py-2.5 font-bold">{t.appointments.colFacility}</th>
                <th className="px-3 py-2.5 font-bold">{t.appointments.colTime}</th>
                <th className="px-3 py-2.5 text-center font-bold">
                  {t.appointments.colQueue}
                </th>
                <th className="px-3 py-2.5 font-bold">{t.appointments.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => {
                const facility = facilities.find(
                  (f) => f.id === appointment.facility
                );
                return (
                  <tr
                    key={appointment.id}
                    className={`border-b border-slate-100 transition last:border-0 ${
                      appointment.isNew ? "bg-status-safe-tint/60" : "hover:bg-brand-tint/40"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2 font-extrabold text-slate-800">
                        {appointment.patientName}
                        {appointment.isNew && (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                            {t.appointments.newTag}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-600">
                      {facility?.name ?? appointment.facility}
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-slate-600">
                      {appointment.time}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-brand-tint px-1.5 text-sm font-black text-brand ring-1 ring-blue-200">
                        {appointment.queueNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLES[appointment.status]}`}
                      >
                        {appointment.status === "Waiting"
                          ? t.appointments.statusWaiting
                          : t.appointments.statusCompleted}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-400">
                      {t.appointments.noAppointmentsToday}
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