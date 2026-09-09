"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPlus,
  HeartHandshake,
  Phone,
  Search,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";

import {
  addAppointment,
  type StoredAppointment,
} from "@/lib/appointments";
import {
  getAshaPatients,
  markAshaReferred,
  registerPatient,
  type AshaPatient,
  type Gender,
} from "@/lib/ashaPatients";
import { facilities, getFacilityById } from "@/lib/data";
import { scrollToFirstError } from "@/lib/scrollToError";
import {
  SEVERITY_EMOJI,
  SEVERITY_LABELS,
  localTriage,
  type TriageSeverity,
} from "@/lib/triage";
import { getTranslations, translations, type Language } from "@/lib/translations";

const SEVERITY_CHIP_STYLES: Record<TriageSeverity, string> = {
  red: "bg-status-emergency-tint text-status-emergency ring-red-200",
  yellow: "bg-status-attention-tint text-status-attention ring-amber-200",
  green: "bg-status-safe-tint text-status-safe ring-emerald-200",
};

const GENDER_KEYS: Gender[] = ["male", "female", "other"];

/** Local YYYY-MM-DD (matches how the other pages compute \"today\"). */
function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Next half-hour slot label (9:00 AM – 4:30 PM); falls back to 9:00 AM. */
function nextSlotLabel(): string {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const next = Math.ceil(minutes / 30) * 30;
  if (next < 9 * 60 || next > 16 * 60 + 30) return "9:00 AM";
  const hour = Math.floor(next / 60);
  const minute = next % 60;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute === 0 ? "00" : "30"} ${period}`;
}

export default function AshaClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].asha.title;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [village, setVillage] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [facility, setFacility] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [toast, setToast] = useState<string | null>(null);
  const [patients, setPatients] = useState<AshaPatient[]>([]);

  useEffect(() => {
    setPatients(getAshaPatients());
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function fieldError(field: "name" | "phone"): string | undefined {
    if (!touched[field]) return undefined;
    if (field === "name") {
      const text = name.trim();
      if (!text) return t.appointments.errorName;
      if (text.length < 3) return t.appointments.nameMin;
    } else {
      if (!phone) return t.appointments.phoneRequired;
      if (!/^[6-9]\d{9}$/.test(phone)) return t.appointments.phoneInvalid;
    }
    return undefined;
  }

  function handleRegister() {
    const nameText = name.trim();
    const nameError = !nameText
      ? t.appointments.errorName
      : nameText.length < 3
        ? t.appointments.nameMin
        : undefined;
    const phoneError = !phone
      ? t.appointments.phoneRequired
      : !/^[6-9]\d{9}$/.test(phone)
        ? t.appointments.phoneInvalid
        : undefined;
    setTouched({ name: true, phone: true });
    if (nameError || phoneError) {
      // Bring the first invalid field into view once errors render.
      window.setTimeout(scrollToFirstError, 0);
      return;
    }

    const patient: AshaPatient = {
      id: `asha-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: nameText,
      phone,
      age: age.trim(),
      gender,
      village: village.trim(),
      symptoms: symptoms.trim(),
      facility,
      registeredAt: localDateString(new Date()),
    };
    registerPatient(patient);
    setPatients(getAshaPatients());

    setName("");
    setPhone("");
    setAge("");
    setGender("");
    setVillage("");
    setSymptoms("");
    setFacility("");
    setTouched({ name: false, phone: false });
    showToast(t.asha.registeredToast);
  }

  /** Create a booking in the shared store — it appears in the doctor's queue. */
  function referToDoctor(patient: AshaPatient) {
    if (!patient.symptoms || patient.referredAt) return;
    const triage = localTriage(patient.symptoms, lang);
    const queue = Math.floor(Math.random() * 50) + 1;
    const appointment: StoredAppointment = {
      id: `asha-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      patientName: patient.name,
      facility: patient.facility || "shelgaon-sub-centre",
      date: localDateString(new Date()),
      time: nextSlotLabel(),
      phone: patient.phone,
      queueNumber: queue,
      status: "Waiting",
      severity: triage.severity,
      symptoms: patient.symptoms,
      isNew: true,
    };
    addAppointment(appointment);
    markAshaReferred(patient.id, appointment.date);
    setPatients(getAshaPatients());
    showToast(t.asha.referredToast.replace("{n}", String(queue)));
  }

  const inputClasses = (hasError: boolean) =>
    `ds-input mt-2 text-sm font-semibold ${
      hasError
        ? "border-status-emergency bg-status-emergency-tint/50"
        : ""
    }`;

  const fieldErrorElement = (field: "name" | "phone") => {
    const message = fieldError(field);
    return message ? (
      <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-status-emergency">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {message}
      </p>
    ) : null;
  };

  const genderLabel: Record<Gender, string> = {
    male: t.asha.genderMale,
    female: t.asha.genderFemale,
    other: t.asha.genderOther,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 ds-toast rounded-xl px-4 py-3 text-center text-sm font-extrabold text-status-safe "
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.asha.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-brand md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.asha.description}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[440px_1fr]">
        {/* Registration form */}
        <section className="h-fit ds-panel p-6 lg:sticky lg:top-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-status-attention-tint text-status-attention">
              <ClipboardPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800">{t.asha.registerTitle}</h2>
              <p className="text-xs text-slate-500">{t.asha.registerSub}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">
                {t.asha.nameLabel} <span className="text-status-emergency">*</span>
              </span>
              <input
                type="text"
                value={name}
                maxLength={100}
                onChange={(event) => {
                  // Digits rejected; capitalize each word of the name.
                  setName(
                    event.target.value
                      .replace(/\d/g, "")
                      .replace(/(^|\s)([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase())
                  );
                  setTouched((previous) => ({ ...previous, name: true }));
                }}
                placeholder={t.asha.namePh}
                className={inputClasses(Boolean(fieldError("name")))}
              />
              {fieldErrorElement("name")}
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">
                {t.asha.phoneLabel} <span className="text-status-emergency">*</span>
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                maxLength={10}
                onChange={(event) => {
                  setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
                  setTouched((previous) => ({ ...previous, phone: true }));
                }}
                placeholder={t.asha.phonePh}
                className={inputClasses(Boolean(fieldError("phone")))}
              />
              {fieldErrorElement("phone")}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-600">{t.asha.ageLabel}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                value={age}
                onChange={(event) => setAge(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                placeholder={t.asha.agePh}
                className={inputClasses(false)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-600">{t.asha.genderLabel}</span>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as Gender | "")}
                className={inputClasses(false)}
              >
                <option value="">—</option>
                {GENDER_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {genderLabel[key]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-600">{t.asha.villageLabel}</span>
              <input
                type="text"
                value={village}
                onChange={(event) => setVillage(event.target.value)}
                placeholder={t.asha.villagePh}
                className={inputClasses(false)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-600">{t.asha.facilityLabel}</span>
              <select
                value={facility}
                onChange={(event) => setFacility(event.target.value)}
                className={inputClasses(false)}
              >
                <option value="">{t.asha.facilityPh}</option>
                {facilities.map((facilityOption) => (
                  <option key={facilityOption.id} value={facilityOption.id}>
                    {facilityOption.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">{t.asha.symptomsLabel}</span>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                placeholder={t.asha.symptomsPh}
                className={`${inputClasses(false)} resize-y`}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleRegister}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-amber-600/25 transition hover:bg-amber-700"
          >
            <UserPlus className="h-5 w-5" />
            {t.asha.registerButton}
          </button>
        </section>

        {/* My Patients */}
        <section className="min-w-0 ds-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800">{t.asha.myPatients}</h2>
                <p className="text-xs text-slate-500">{t.asha.myPatientsSub}</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
              {patients.length}
            </span>
          </div>

          {patients.length === 0 ? (
            <p className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center text-sm font-semibold text-slate-400">
              {t.asha.noPatients}
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {patients.map((patient) => {
                const assigned = getFacilityById(patient.facility);
                const hasSymptoms = Boolean(patient.symptoms.trim());
                const triage = hasSymptoms
                  ? localTriage(patient.symptoms, lang)
                  : null;
                const referred = Boolean(patient.referredAt);
                return (
                  <li
                    key={patient.id}
                    className="flex flex-col gap-4 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-extrabold text-slate-800">
                          {patient.name}
                        </p>
                        {triage && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${SEVERITY_CHIP_STYLES[triage.severity]}`}
                          >
                            {SEVERITY_EMOJI[triage.severity]}{" "}
                            {SEVERITY_LABELS[triage.severity][lang]}
                          </span>
                        )}
                        {referred && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-extrabold text-brand ring-1 ring-blue-200">
                            <CheckCircle2 className="h-3 w-3" />
                            {t.asha.referredChip}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                        {patient.age && <span>{t.doctor.ageLabel}: {patient.age}</span>}
                        {patient.gender && <span>{genderLabel[patient.gender]}</span>}
                        {patient.village && <span>📍 {patient.village}</span>}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-600">
                        {assigned?.name ?? t.asha.facilityPh}
                      </p>
                      {patient.symptoms && (
                        <p className="mt-1 truncate text-xs italic text-slate-500">
                          “{patient.symptoms}”
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <Link
                        href={`/triage?s=${encodeURIComponent(patient.symptoms)}`}
                        aria-disabled={!hasSymptoms}
                        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition sm:w-auto ${
                          hasSymptoms
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                            : "pointer-events-none bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Search className="h-3.5 w-3.5" />
                        {t.asha.quickTriage}
                      </Link>
                      <button
                        type="button"
                        disabled={!hasSymptoms || referred}
                        onClick={() => referToDoctor(patient)}
                        title={hasSymptoms ? undefined : t.asha.noSymptomsHint}
                        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition sm:w-auto ${
                          referred
                            ? "cursor-default bg-slate-100 text-slate-400"
                            : hasSymptoms
                              ? "bg-brand-strong text-brand-strong-ink  hover:bg-brand"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                        }`}
                      >
                        {referred ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t.asha.referredChip}
                          </>
                        ) : (
                          <>
                            <Stethoscope className="h-3.5 w-3.5" />
                            {t.asha.referDoctor}
                          </>
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {patients.length > 0 && (
            <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {t.asha.noSymptomsHint}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
