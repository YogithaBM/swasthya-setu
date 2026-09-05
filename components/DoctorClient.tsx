"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  History,
  Microscope,
  Pill,
  Printer,
  Plus,
  Send,
  Stethoscope,
  Trash2,
  User,
  Users,
} from "lucide-react";

import {
  getAppointments,
  updateAppointmentStatus,
  type StoredAppointment,
} from "@/lib/appointments";
import { getFacilityById, facilities } from "@/lib/data";
import { addFollowup } from "@/lib/followups";
import {
  addLabOrder,
  getLabOrders,
  LAB_TEST_OPTIONS,
  type LabOrder,
  type LabStatus,
} from "@/lib/labOrders";
import {
  getPatientHistory,
  saveRecord,
  type PatientRecord,
} from "@/lib/patientRecords";
import { addReferral } from "@/lib/referrals";
import { SEVERITY_EMOJI, SEVERITY_LABELS, type TriageSeverity } from "@/lib/triage";
import { getTranslations, translations, type Language } from "@/lib/translations";

type FrequencyKey = "once" | "twice" | "thrice" | "asNeeded";

interface Patient {
  id: string;
  name: string;
  age: number;
  symptoms: { en: string; hi: string };
  severity: TriageSeverity;
  queueNumber: number;
  waitingMinutes: number;
  /** Set when the patient came from a booked appointment (localStorage). */
  appointmentId?: string;
  /** Facility id where the patient presented (from their booking). */
  facilityId?: string;
  /** 10-digit mobile (from their booking). */
  phone?: string;
  isNew?: boolean;
}

interface MedicineRow {
  id: number;
  name: string;
  dosage: string;
  frequency: FrequencyKey;
  duration: string;
}

const PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Ramesh Patil",
    age: 52,
    symptoms: { en: "Chest pain and sweating", hi: "छाती में दर्द और पसीना" },
    severity: "red",
    queueNumber: 5,
    waitingMinutes: 12,
  },
  {
    id: "p2",
    name: "Meena Joshi",
    age: 48,
    symptoms: { en: "Difficulty breathing", hi: "साँस लेने में तकलीफ" },
    severity: "red",
    queueNumber: 9,
    waitingMinutes: 25,
  },
  {
    id: "p3",
    name: "Sunita Kale",
    age: 34,
    symptoms: { en: "High fever for 3 days", hi: "3 दिन से तेज़ बुखार" },
    severity: "yellow",
    queueNumber: 14,
    waitingMinutes: 40,
  },
  {
    id: "p4",
    name: "Irfan Shaikh",
    age: 29,
    symptoms: { en: "Stomach pain and vomiting", hi: "पेट दर्द और उल्टी" },
    severity: "yellow",
    queueNumber: 17,
    waitingMinutes: 55,
  },
  {
    id: "p5",
    name: "Asha Thakre",
    age: 22,
    symptoms: { en: "Mild headache", hi: "हल्का सिरदर्द" },
    severity: "green",
    queueNumber: 20,
    waitingMinutes: 70,
  },
  {
    id: "p6",
    name: "Vijay More",
    age: 38,
    symptoms: { en: "Common cold and cough", hi: "जुकाम और खांसी" },
    severity: "green",
    queueNumber: 22,
    waitingMinutes: 85,
  },
];

const SEVERITY_RANK: Record<TriageSeverity, number> = { red: 0, yellow: 1, green: 2 };

const SORTED_PATIENTS = [...PATIENTS].sort(
  (a, b) =>
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
    a.queueNumber - b.queueNumber
);

/** Convert a stored appointment (from /appointments) into a doctor-queue row. */
function appointmentToPatient(appointment: StoredAppointment): Patient {
  const facility = facilities.find((f) => f.id === appointment.facility);
  const place = facility ? facility.name : appointment.facility;
  return {
    id: `appt-${appointment.id}`,
    name: appointment.patientName,
    age: 0,
    symptoms: {
      en: appointment.symptoms || `Appointment at ${place}`,
      hi: appointment.symptoms || `${place} पर अपॉइंटमेंट`,
    },
    severity: appointment.severity,
    queueNumber: appointment.queueNumber,
    waitingMinutes: 0,
    appointmentId: appointment.id,
    facilityId: appointment.facility,
    phone: appointment.phone,
    isNew: appointment.isNew,
  };
}

/** Hardcoded patients + waiting appointments synced from the booking page. */
function mergeQueue(): Patient[] {
  const stored = getAppointments();
  const hardcodedNames = new Set(
    PATIENTS.map((patient) => patient.name.toLowerCase())
  );
  const fresh: Patient[] = [];
  const rest: Patient[] = [];
  for (const appointment of stored) {
    if (appointment.status !== "Waiting") continue;
    // The hardcoded row (with age/richer symptoms) wins for the same patient.
    if (hardcodedNames.has(appointment.patientName.toLowerCase())) continue;
    const patient = appointmentToPatient(appointment);
    (appointment.isNew ? fresh : rest).push(patient);
  }
  rest.sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      a.queueNumber - b.queueNumber
  );
  return [...fresh, ...SORTED_PATIENTS, ...rest];
}

const SEVERITY_CHIP_STYLES: Record<TriageSeverity, string> = {
  red: "bg-red-50 text-red-700 ring-red-200",
  yellow: "bg-amber-50 text-amber-800 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const LAB_STATUS_STYLES: Record<LabStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  "Sample Collected": "bg-sky-100 text-sky-800 ring-sky-200",
  "Results Ready": "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

const FREQUENCY_KEYS: FrequencyKey[] = ["once", "twice", "thrice", "asNeeded"];

interface SavedPrescription {
  patient: Patient;
  date: string;
  diagnosis: string;
  medicines: MedicineRow[];
  notes: string;
  referral: boolean;
  followUp?: boolean;
  followUpDate?: string;
  referTarget?: string;
  labTests?: string[];
}

/** Local YYYY-MM-DD (matches how the other pages compute "today"). */
function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Facility the doctor is treating the patient at (their booking facility, else district hospital). */
function originFacilityId(patient: Patient): string {
  return patient.facilityId || "amravati-district-hospital";
}

let medicineCounter = 1;

export default function DoctorClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].doctor.title;

  const [selectedPatient, setSelectedPatient] = useState<Patient>(SORTED_PATIENTS[0]);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { id: medicineCounter++, name: "", dosage: "", frequency: "twice", duration: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [referral, setReferral] = useState(false);
  const [referTarget, setReferTarget] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [labTests, setLabTests] = useState<string[]>([]);
  const [history, setHistory] = useState<PatientRecord[]>([]);
  const [patientOrders, setPatientOrders] = useState<LabOrder[]>([]);
  const [errors, setErrors] = useState<{
    diagnosis?: string;
    medicines?: string;
    referTarget?: string;
    followUp?: string;
  }>({});
  const [saved, setSaved] = useState<SavedPrescription | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // The live queue = hardcoded patients + stored appointments (synced from /appointments).
  const [queue, setQueue] = useState<Patient[]>(SORTED_PATIENTS);
  const todayStr = localDateString(new Date());

  // Load the longitudinal history + lab orders for the pre-selected patient.
  useEffect(() => {
    setQueue(mergeQueue());
    const initial = SORTED_PATIENTS[0];
    setHistory(getPatientHistory(initial.name, initial.phone));
    setPatientOrders(ordersForName(initial.name));
  }, []);

  /** Lab orders for a patient name (case-insensitive), newest first. */
  function ordersForName(name: string): LabOrder[] {
    const needle = name.trim().toLowerCase();
    return getLabOrders().filter(
      (order) => order.patientName.trim().toLowerCase() === needle
    );
  }

  const symptoms = selectedPatient.symptoms[lang];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function updateMedicine(
    id: number,
    patch: Partial<Omit<MedicineRow, "id">>
  ) {
    setMedicines((previous) =>
      previous.map((medicine) =>
        medicine.id === id ? { ...medicine, ...patch } : medicine
      )
    );
  }

  function addMedicine() {
    setMedicines((previous) => [
      ...previous,
      { id: medicineCounter++, name: "", dosage: "", frequency: "twice", duration: "" },
    ]);
  }

  function removeMedicine(id: number) {
    setMedicines((previous) => previous.filter((medicine) => medicine.id !== id));
  }

  function handleSave() {
    const nextErrors: {
      diagnosis?: string;
      medicines?: string;
      referTarget?: string;
      followUp?: string;
    } = {};
    if (!diagnosis.trim()) nextErrors.diagnosis = t.doctor.errorDiagnosis;

    const complete = medicines.filter((m) => m.name.trim() && m.dosage.trim());
    if (medicines.length === 0 || complete.length === 0) {
      nextErrors.medicines = t.doctor.errorMedicineMin;
    } else if (
      medicines.some(
        (m) =>
          (m.name.trim() && !m.dosage.trim()) ||
          (!m.name.trim() && m.dosage.trim())
      )
    ) {
      nextErrors.medicines = t.doctor.errorMedicine;
    }

    if (referral && !referTarget) {
      nextErrors.referTarget = t.doctor.referError;
    }
    if (followUp && !followUpDate) {
      nextErrors.followUp = t.doctor.followUpError;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const date = localDateString(new Date());
    const meds = medicines.filter((m) => m.name.trim() && m.dosage.trim());
    const origin = originFacilityId(selectedPatient);

    // Feature 1 — longitudinal patient record (always saved).
    saveRecord({
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      patientName: selectedPatient.name,
      phone: selectedPatient.phone ?? "",
      date,
      diagnosis: diagnosis.trim(),
      medicines: meds.map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency,
        duration: m.duration.trim(),
      })),
      severity: selectedPatient.severity,
      doctorNotes: notes.trim(),
      facility: origin,
    });
    // Feature 2 — high-risk follow-up.
    if (followUp) {
      addFollowup({
        id: `fu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        patientName: selectedPatient.name,
        diagnosis: diagnosis.trim(),
        followUpDate,
        facility: origin,
        createdAt: date,
      });
    }

    // Feature 3 — referral tracking.
    if (referral) {
      addReferral({
        id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        patientName: selectedPatient.name,
        fromFacility: origin,
        toFacility: referTarget,
        date,
        status: "Pending",
        reason: diagnosis.trim(),
      });
    }

    // Feature 4 — lab test ordering.
    if (labTests.length > 0) {
      addLabOrder({
        id: `lab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        patientName: selectedPatient.name,
        tests: labTests,
        facility: origin,
        date,
        status: "Pending",
      });
    }

    // Refresh the timeline so this visit (and its lab orders) show immediately.
    setHistory(getPatientHistory(selectedPatient.name, selectedPatient.phone));
    setPatientOrders(ordersForName(selectedPatient.name));

    const extras: string[] = [];
    if (followUp) {
      extras.push(
        t.doctor.followupToast.replace("{date}", formatLongDate(followUpDate))
      );
    }
    if (referral) {
      extras.push(
        t.doctor.referralToast.replace(
          "{facility}",
          getFacilityById(referTarget)?.name ?? referTarget
        )
      );
    }
    if (labTests.length > 0) {
      extras.push(t.doctor.labToast.replace("{n}", String(labTests.length)));
    }
    if (extras.length > 0) showToast(extras.join(" · "));

    setSaved({
      patient: selectedPatient,
      date,
      diagnosis: diagnosis.trim(),
      medicines: meds,
      notes: notes.trim(),
      referral,
      followUp,
      followUpDate,
      referTarget,
      labTests,
    });
  }

  function newPrescription() {
    setSaved(null);
    setDiagnosis("");
    setMedicines([
      { id: medicineCounter++, name: "", dosage: "", frequency: "twice", duration: "" },
    ]);
    setNotes("");
    setReferral(false);
    setReferTarget("");
    setFollowUp(false);
    setFollowUpDate("");
    setLabTests([]);
    setErrors({});
  }

  function selectPatient(patient: Patient) {
    setSelectedPatient(patient);
    setSaved(null);
    setErrors({});
    setReferral(false);
    setReferTarget("");
    setFollowUp(false);
    setFollowUpDate("");
    setLabTests([]);
    // Feature 1 — load this patient's longitudinal history + lab orders.
    setHistory(getPatientHistory(patient.name, patient.phone));
    setPatientOrders(ordersForName(patient.name));
  }

  /** Mark a booked appointment patient as seen/completed (persists to the shared store). */
  function completeAppointment(patient: Patient) {
    if (!patient.appointmentId) return;
    updateAppointmentStatus(patient.appointmentId, "Completed");
    const next = queue.filter((item) => item.id !== patient.id);
    setQueue(next);
    if (selectedPatient.id === patient.id) {
      setSelectedPatient(next[0] ?? SORTED_PATIENTS[0]);
    }
    showToast(t.doctor.completedToast);
  }

  function formatLongDate(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(
      lang === "hi" ? "hi-IN" : "en-IN",
      { day: "numeric", month: "long", year: "numeric" }
    );
  }

  function labStatusLabel(status: LabStatus): string {
    if (status === "Pending") return t.labOrders.statusPending;
    if (status === "Sample Collected") return t.labOrders.statusSample;
    return t.labOrders.statusResults;
  }

  const medicineErrorText = errors.medicines;
  /** Orders whose date does not line up with any saved visit record. */
  const unmatchedOrders = patientOrders.filter(
    (order) => !history.some((record) => record.date === order.date)
  );

  function ordersForDate(dateStr: string): LabOrder[] {
    return patientOrders.filter((order) => order.date === dateStr);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-extrabold text-white shadow-xl"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
          <Stethoscope className="h-4 w-4" />
          {t.doctor.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
          {t.doctor.title}
        </h1>
        <p className="mt-2 text-lg font-bold text-blue-800 md:text-2xl">{otherTitle}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          {t.doctor.description}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[370px_1fr]">
        {/* LEFT — Patient queue */}
        <section className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-6">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-slate-800">{t.doctor.queueTitle}</h2>
              <p className="truncate text-xs text-slate-500">{t.doctor.queueSub}</p>
            </div>
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
              {queue.length}
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {queue.map((patient) => {
              const selected = selectedPatient.id === patient.id;
              return (
                <li key={patient.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectPatient(patient)}
                    className={`flex w-full min-w-0 flex-1 items-center gap-3 rounded-2xl p-3 text-left transition ${
                      selected
                        ? "bg-blue-50/80 ring-2 ring-blue-700"
                        : "ring-1 ring-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ring-1 ${SEVERITY_CHIP_STYLES[patient.severity]}`}
                      aria-hidden="true"
                    >
                      {SEVERITY_EMOJI[patient.severity]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm font-extrabold text-slate-800">
                            {patient.name}
                          </span>
                          {patient.isNew && (
                            <span className="shrink-0 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                              {t.appointments.newTag}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 rounded-lg bg-blue-50 px-1.5 py-0.5 text-xs font-black text-blue-800 ring-1 ring-blue-200">
                          #{patient.queueNumber}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {patient.symptoms[lang]}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${SEVERITY_CHIP_STYLES[patient.severity]}`}
                        >
                          {SEVERITY_EMOJI[patient.severity]}{" "}
                          {SEVERITY_LABELS[patient.severity][lang]}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {patient.waitingMinutes} {t.doctor.minutesUnit}{" "}
                          {t.doctor.waitingWord}
                        </span>
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${
                        selected ? "text-blue-700" : "text-slate-300"
                      }`}
                    />
                  </button>
                  {patient.appointmentId && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        completeAppointment(patient);
                      }}
                      title={t.doctor.markCompleted}
                      aria-label={t.doctor.markCompleted}
                      className="flex h-11 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 transition hover:bg-emerald-100 hover:text-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* RIGHT — details + prescription */}
        <section className="min-w-0">
          {saved ? (
            <div className="print-prescription rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
              {/* Brand header */}
              <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-4">
                <div>
                  <p className="text-2xl font-black tracking-tight text-blue-900">
                    {t.appName}
                  </p>
                  <p className="text-sm font-extrabold text-emerald-600">
                    {t.doctor.cardHeader}
                  </p>
                </div>
                <span className="rounded-xl bg-emerald-50 px-3 py-2 text-right ring-1 ring-emerald-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.appointments.selectedDate}
                  </p>
                  <p className="text-sm font-extrabold text-slate-800">
                    {formatLongDate(saved.date)}
                  </p>
                </span>
              </div>

              {/* Patient + doctor strip */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.doctor.patientLabel}
                  </p>
                  <p className="mt-0.5 text-sm font-extrabold text-slate-800">
                    {saved.patient.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.doctor.ageLabel}:{" "}
                    {saved.patient.age > 0
                      ? `${saved.patient.age} ${t.doctor.ageUnit}`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.doctor.severityLabel}
                  </p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ring-1 ${SEVERITY_CHIP_STYLES[saved.patient.severity]}`}
                  >
                    {SEVERITY_EMOJI[saved.patient.severity]}{" "}
                    {SEVERITY_LABELS[saved.patient.severity][lang]}
                  </span>
                  {saved.referral && (
                    <p className="mt-1 text-[11px] font-bold text-red-600">
                      ⚠ {t.doctor.urgency}
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.doctor.doctorLabel}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                    <Stethoscope className="h-4 w-4 text-emerald-600" />
                    {t.doctor.doctorName}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t.doctor.diagnosis}
                </p>
                <p className="mt-0.5 text-base font-extrabold text-slate-800">
                  {saved.diagnosis}
                </p>
              </div>

              {/* Medicines table */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="py-2 pr-3 font-bold">{t.doctor.medName}</th>
                      <th className="px-3 py-2 font-bold">{t.doctor.dosage}</th>
                      <th className="px-3 py-2 font-bold">{t.doctor.frequency}</th>
                      <th className="px-3 py-2 font-bold">{t.doctor.duration}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saved.medicines.map((medicine) => (
                      <tr key={medicine.id} className="border-b border-slate-100">
                        <td className="py-2.5 pr-3 font-extrabold text-slate-800">
                          {medicine.name}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-600">
                          {medicine.dosage}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-600">
                          {t.doctor.frequencies[medicine.frequency]}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-600">
                          {medicine.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {saved.notes && (
                <div className="mt-5 rounded-xl bg-amber-50/70 px-4 py-3 ring-1 ring-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    {t.doctor.notes}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">
                    {saved.notes}
                  </p>
                </div>
              )}

              {/* Follow-up + referral + lab outcome tiles */}
              {(saved.followUp ||
                saved.referral ||
                (saved.labTests?.length ?? 0) > 0) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {saved.followUp && saved.followUpDate && (
                    <div className="rounded-xl bg-blue-50/70 px-4 py-3 ring-1 ring-blue-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {t.doctor.scheduleFollowup}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                        <CalendarClock className="h-4 w-4 text-blue-700" />
                        {formatLongDate(saved.followUpDate)}
                      </p>
                    </div>
                  )}
                  {saved.referral && saved.referTarget && (
                    <div className="rounded-xl bg-red-50/70 px-4 py-3 ring-1 ring-red-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                        {t.doctor.referTarget}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                        <ArrowLeftRight className="h-4 w-4 text-red-600" />
                        {getFacilityById(saved.referTarget)?.name ?? saved.referTarget}
                      </p>
                    </div>
                  )}
                  {saved.labTests && saved.labTests.length > 0 && (
                    <div className="rounded-xl bg-sky-50/70 px-4 py-3 ring-1 ring-sky-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                        {t.doctor.orderTests}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {saved.labTests.map((test) => (
                          <span
                            key={test}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-sky-800 ring-1 ring-sky-200"
                          >
                            <Microscope className="h-3 w-3" />
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer: QR + actions */}
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-xl bg-slate-900 p-2">
                    <span className="font-mono text-[9px] leading-[3px] tracking-tight text-white opacity-90">
                      ██ █ █ ██ ██ █ █ ██ ██ ██ █ ██ █ ██ ██ █ ██ █ █ ██ ██ ██ █ ██ █
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">
                      {t.doctor.qrText}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {t.doctor.patientLabel}: {saved.patient.name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={newPrescription}
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold text-blue-800 ring-1 ring-blue-200 transition hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" />
                    {t.doctor.newPrescription}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-800/25 transition hover:bg-blue-900"
                  >
                    <Printer className="h-4 w-4" />
                    {t.doctor.print}
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(t.doctor.sentToast)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4" />
                    {t.doctor.sendToPatient}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
              {/* Patient details */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {t.doctor.patientDetails}
                    </p>
                    <h2 className="text-lg font-extrabold text-slate-800">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t.doctor.ageLabel}:{" "}
                      {selectedPatient.age > 0
                        ? `${selectedPatient.age} ${t.doctor.ageUnit}`
                        : "—"}{" "}
                      · {t.doctor.symptomsLabel}: {symptoms}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ${SEVERITY_CHIP_STYLES[selectedPatient.severity]}`}
                >
                  {SEVERITY_EMOJI[selectedPatient.severity]}{" "}
                  {SEVERITY_LABELS[selectedPatient.severity][lang]}
                </span>
              </div>

              <div className="my-5 h-px bg-slate-100" />

              {/* Form */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800">
                    {t.doctor.formTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t.doctor.doctorName} · {t.doctor.patientLabel}:{" "}
                    {selectedPatient.name}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <label className="mt-5 block">
                <span className="text-sm font-bold text-slate-600">
                  {t.doctor.diagnosis}
                  <span className="text-red-500"> *</span>
                </span>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(event) => {
                    setDiagnosis(event.target.value);
                    if (errors.diagnosis && event.target.value.trim()) {
                      setErrors((previous) => ({ ...previous, diagnosis: undefined }));
                    }
                  }}
                  placeholder={t.doctor.diagPlaceholder}
                  className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.diagnosis
                      ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-200 bg-slate-50 focus:border-blue-700 focus:ring-blue-700/20"
                  }`}
                />
                {errors.diagnosis && (
                  <p className="mt-1.5 text-xs font-bold text-red-600">
                    {errors.diagnosis}
                  </p>
                )}
              </label>

              {/* Medicines */}
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-blue-700" />
                  <span className="text-sm font-bold text-slate-600">
                    {t.doctor.medicinesLabel}
                    <span className="text-red-500"> *</span>
                  </span>
                </div>

                {medicineErrorText && (
                  <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 ring-1 ring-red-200">
                    {medicineErrorText}
                  </p>
                )}

                <div className="mt-3 space-y-3">
                  {medicines.length === 0 && (
                    <p className="rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-center text-xs font-semibold text-slate-400">
                      {t.doctor.errorMedicineMin}
                    </p>
                  )}
                  {medicines.map((medicine, index) => (
                    <div
                      key={medicine.id}
                      className="relative rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          {t.doctor.medicinesLabel} {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedicine(medicine.id)}
                          title={t.doctor.removeMedicine}
                          aria-label={t.doctor.removeMedicine}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-red-500 ring-1 ring-red-100 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="block">
                          <span className="text-[11px] font-bold text-slate-500">
                            {t.doctor.medName}
                          </span>
                          <input
                            type="text"
                            value={medicine.name}
                            onChange={(event) =>
                              updateMedicine(medicine.id, { name: event.target.value })
                            }
                            placeholder={t.doctor.medNamePh}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-bold text-slate-500">
                            {t.doctor.dosage}
                          </span>
                          <input
                            type="text"
                            value={medicine.dosage}
                            onChange={(event) =>
                              updateMedicine(medicine.id, {
                                dosage: event.target.value,
                              })
                            }
                            placeholder={t.doctor.dosagePh}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-bold text-slate-500">
                            {t.doctor.frequency}
                          </span>
                          <select
                            value={medicine.frequency}
                            onChange={(event) =>
                              updateMedicine(medicine.id, {
                                frequency: event.target.value as FrequencyKey,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                          >
                            {FREQUENCY_KEYS.map((key) => (
                              <option key={key} value={key}>
                                {t.doctor.frequencies[key]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-bold text-slate-500">
                            {t.doctor.duration}
                          </span>
                          <input
                            type="text"
                            value={medicine.duration}
                            onChange={(event) =>
                              updateMedicine(medicine.id, {
                                duration: event.target.value,
                              })
                            }
                            placeholder={t.doctor.durationPh}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMedicine}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-2.5 text-sm font-extrabold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4" />
                  {t.doctor.addMedicine}
                </button>
              </div>

              {/* Lab tests */}
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <Microscope className="h-4 w-4 text-sky-700" />
                  <div>
                    <p className="text-sm font-bold text-slate-600">
                      {t.doctor.orderTests}
                    </p>
                    <p className="text-[11px] text-slate-400">{t.doctor.orderTestsSub}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {LAB_TEST_OPTIONS.map((test) => {
                    const selected = labTests.includes(test);
                    return (
                      <label
                        key={test}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 ring-1 transition ${
                          selected
                            ? "bg-sky-50 ring-sky-300"
                            : "bg-slate-50 ring-slate-200 hover:bg-sky-50/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            setLabTests((previous) =>
                              selected
                                ? previous.filter((item) => item !== test)
                                : [...previous, test]
                            )
                          }
                          className="h-4 w-4 accent-sky-600"
                        />
                        <span
                          className={`text-xs font-bold ${
                            selected ? "text-sky-900" : "text-slate-600"
                          }`}
                        >
                          {test}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <label className="mt-6 block">
                <span className="text-sm font-bold text-slate-600">
                  {t.doctor.notes}
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder={t.doctor.notesPlaceholder}
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                />
              </label>

              {/* Urgency — referral to a higher facility */}
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl bg-red-50/60 px-4 py-3 ring-1 ring-red-100">
                <input
                  type="checkbox"
                  checked={referral}
                  onChange={(event) => {
                    setReferral(event.target.checked);
                    if (!event.target.checked) setReferTarget("");
                    if (errors.referTarget) {
                      setErrors((previous) => ({
                        ...previous,
                        referTarget: undefined,
                      }));
                    }
                  }}
                  className="h-4 w-4 accent-red-600"
                />
                <span className="text-sm font-bold text-red-700">
                  ⚠ {t.doctor.urgency}
                </span>
              </label>

              {referral && (
                <div className="mt-3 rounded-xl bg-red-50/40 p-4 ring-1 ring-red-100">
                  <label className="block">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                      <ArrowLeftRight className="h-4 w-4 text-red-600" />
                      {t.doctor.referTarget}
                      <span className="text-red-500"> *</span>
                    </span>
                    <select
                      value={referTarget}
                      onChange={(event) => {
                        setReferTarget(event.target.value);
                        if (errors.referTarget && event.target.value) {
                          setErrors((previous) => ({
                            ...previous,
                            referTarget: undefined,
                          }));
                        }
                      }}
                      className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.referTarget
                          ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 bg-white focus:border-red-500 focus:ring-red-200"
                      }`}
                    >
                      <option value="">{t.doctor.referTargetPh}</option>
                      {facilities
                        .filter((facility) => facility.id !== originFacilityId(selectedPatient))
                        .map((facility) => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name} — {t.levels[facility.level]}
                          </option>
                        ))}
                    </select>
                    {errors.referTarget && (
                      <p className="mt-1.5 text-xs font-bold text-red-600">
                        {errors.referTarget}
                      </p>
                    )}
                  </label>
                </div>
              )}

              {/* High-risk follow-up */}
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl bg-blue-50/60 px-4 py-3 ring-1 ring-blue-100">
                <input
                  type="checkbox"
                  checked={followUp}
                  onChange={(event) => {
                    setFollowUp(event.target.checked);
                    if (!event.target.checked) setFollowUpDate("");
                    if (errors.followUp) {
                      setErrors((previous) => ({ ...previous, followUp: undefined }));
                    }
                  }}
                  className="h-4 w-4 accent-blue-700"
                />
                <span className="flex items-center gap-1.5 text-sm font-bold text-blue-800">
                  <CalendarClock className="h-4 w-4" />
                  {t.doctor.scheduleFollowup}
                </span>
              </label>

              {followUp && (
                <div className="mt-3 rounded-xl bg-blue-50/40 p-4 ring-1 ring-blue-100">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-600">
                      {t.doctor.followupDate}
                      <span className="text-red-500"> *</span>
                    </span>
                    <input
                      type="date"
                      min={todayStr}
                      value={followUpDate}
                      onChange={(event) => {
                        setFollowUpDate(event.target.value);
                        if (errors.followUp && event.target.value) {
                          setErrors((previous) => ({ ...previous, followUp: undefined }));
                        }
                      }}
                      className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.followUp
                          ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 bg-white focus:border-blue-700 focus:ring-blue-700/20"
                      }`}
                    />
                    {errors.followUp && (
                      <p className="mt-1.5 text-xs font-bold text-red-600">
                        {errors.followUp}
                      </p>
                    )}
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 sm:w-auto"
              >
                <FileText className="h-5 w-5" />
                {t.doctor.savePrescription}
              </button>

              {/* Feature 1 — longitudinal patient history (timeline) */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-700" />
                  <h3 className="text-sm font-extrabold text-slate-800">
                    {t.doctor.pastVisits}
                  </h3>
                  {history.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-800 ring-1 ring-blue-200">
                      {history.length}
                    </span>
                  )}
                </div>

                {history.length === 0 ? (
                  <p className="mt-3 rounded-xl border-2 border-dashed border-slate-200 px-4 py-5 text-center text-xs font-semibold text-slate-400">
                    {t.doctor.noHistory}
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
                          {t.doctor.diagnosis}: {record.diagnosis}
                        </p>
                        {record.medicines.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {record.medicines.map((medicine, medicineIndex) => (
                              <span
                                key={medicineIndex}
                                className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200"
                              >
                                {medicine.name} · {medicine.dosage} ·{" "}
                                {(
                                  t.doctor.frequencies as Record<string, string>
                                )[medicine.frequency] ?? medicine.frequency}{" "}
                                · {medicine.duration}
                              </span>
                            ))}
                          </div>
                        )}
                        {ordersForDate(record.date).map((order) => (
                          <div
                            key={order.id}
                            className="mt-2 flex flex-wrap items-center gap-1.5"
                          >
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-800 ring-1 ring-sky-200">
                              <Microscope className="h-3 w-3" />
                              {order.tests.slice(0, 3).join(", ")}
                              {order.tests.length > 3
                                ? ` +${order.tests.length - 3}`
                                : ""}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${LAB_STATUS_STYLES[order.status]}`}
                            >
                              {labStatusLabel(order.status)}
                            </span>
                          </div>
                        ))}
                        {record.doctorNotes && (
                          <p className="mt-2 text-xs font-medium text-slate-500">
                            {t.doctor.notes}: {record.doctorNotes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}

                {/* Lab orders whose date is not tied to a saved visit */}
                {unmatchedOrders.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {unmatchedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-wrap items-center gap-1.5 rounded-xl bg-sky-50/50 px-3 py-2 ring-1 ring-sky-100"
                      >
                        <span className="text-[11px] font-bold text-slate-500">
                          {formatLongDate(order.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-sky-800 ring-1 ring-sky-200">
                          <Microscope className="h-3 w-3" />
                          {order.tests.join(", ")}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${LAB_STATUS_STYLES[order.status]}`}
                        >
                          {labStatusLabel(order.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
