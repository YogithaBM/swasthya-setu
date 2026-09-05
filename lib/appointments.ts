import type { TriageSeverity } from "@/lib/triage";

export type AppointmentStatus = "Waiting" | "Completed";

export const APPOINTMENTS_STORAGE_KEY = "swasthya_appointments";

/**
 * Canonical appointment record shared between the patient-facing
 * appointments page and the doctor panel via localStorage.
 */
export interface StoredAppointment {
  id: string;
  patientName: string;
  /** Facility id from lib/data (e.g. "anjangaon-phc"). */
  facility: string;
  /** YYYY-MM-DD */
  date: string;
  /** Display label, e.g. "11:00 AM". */
  time: string;
  /** 10-digit Indian mobile (optional — set when the patient books). */
  phone?: string;
  queueNumber: number;
  status: AppointmentStatus;
  severity: TriageSeverity;
  symptoms: string;
  isNew: boolean;
}

/** Hardcoded sample bookings shown on the appointments page + merged into the doctor queue. */
export const SAMPLE_APPOINTMENTS: StoredAppointment[] = [
  {
    id: "s1",
    patientName: "Ramesh Patil",
    facility: "anjangaon-phc",
    date: "",
    time: "9:30 AM",
    queueNumber: 12,
    status: "Completed",
    severity: "yellow",
    symptoms: "Fever and headache",
    isNew: false,
  },
  {
    id: "s2",
    patientName: "Sunita Kale",
    facility: "amravati-district-hospital",
    date: "",
    time: "10:00 AM",
    queueNumber: 7,
    status: "Waiting",
    severity: "yellow",
    symptoms: "High fever for 3 days",
    isNew: false,
  },
  {
    id: "s3",
    patientName: "Mahesh Deshmukh",
    facility: "badnera-rural-hospital",
    date: "",
    time: "11:30 AM",
    queueNumber: 19,
    status: "Waiting",
    severity: "yellow",
    symptoms: "Stomach pain and vomiting",
    isNew: false,
  },
  {
    id: "s4",
    patientName: "Asha Thakre",
    facility: "shelgaon-sub-centre",
    date: "",
    time: "10:30 AM",
    queueNumber: 4,
    status: "Completed",
    severity: "green",
    symptoms: "Mild headache",
    isNew: false,
  },
  {
    id: "s5",
    patientName: "Vijay More",
    facility: "ashti-phc",
    date: "",
    time: "12:00 PM",
    queueNumber: 23,
    status: "Waiting",
    severity: "green",
    symptoms: "Common cold and cough",
    isNew: false,
  },
  {
    id: "s6",
    patientName: "Kavita Wankhede",
    facility: "daryapur-rural-hospital",
    date: "",
    time: "2:00 PM",
    queueNumber: 31,
    status: "Waiting",
    severity: "yellow",
    symptoms: "Joint pain and swelling",
    isNew: false,
  },
];

function isStoredAppointment(value: unknown): value is StoredAppointment {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.patientName === "string" &&
    typeof record.facility === "string" &&
    typeof record.time === "string" &&
    typeof record.queueNumber === "number" &&
    (record.status === "Waiting" || record.status === "Completed") &&
    (record.severity === "green" ||
      record.severity === "yellow" ||
      record.severity === "red")
  );
}

/** Read the shared appointment store, falling back to the hardcoded samples. */
export function getAppointments(): StoredAppointment[] {
  if (typeof window === "undefined") return SAMPLE_APPOINTMENTS;
  try {
    const raw = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!raw) return SAMPLE_APPOINTMENTS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SAMPLE_APPOINTMENTS;
    const valid = parsed.filter(isStoredAppointment);
    return valid.length > 0 ? valid : SAMPLE_APPOINTMENTS;
  } catch {
    return SAMPLE_APPOINTMENTS;
  }
}

/** Persist a new booking (prepended so fresh bookings surface at the top). */
export function addAppointment(appointment: StoredAppointment): void {
  if (typeof window === "undefined") return;
  const current = getAppointments().filter((item) => item.id !== appointment.id);
  window.localStorage.setItem(
    APPOINTMENTS_STORAGE_KEY,
    JSON.stringify([appointment, ...current])
  );
}

/** Flip an appointment's status (used when a doctor completes a patient). */
export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): void {
  if (typeof window === "undefined") return;
  const current = getAppointments().map((appointment) =>
    appointment.id === id ? { ...appointment, status } : appointment
  );
  window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(current));
}