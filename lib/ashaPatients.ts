export type Gender = "male" | "female" | "other";

export interface AshaPatient {
  id: string;
  name: string;
  phone: string;
  /** Optional age in years. */
  age: string;
  gender: Gender | "";
  village: string;
  symptoms: string;
  /** Facility id from lib/data the patient is assigned to. */
  facility: string;
  /** YYYY-MM-DD (when registered). */
  registeredAt: string;
  /** YYYY-MM-DD once the patient has been referred to a doctor. */
  referredAt?: string;
}

export const ASHA_PATIENTS_KEY = "swasthya_asha_patients";

function isAshaPatient(value: unknown): value is AshaPatient {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.phone === "string" &&
    typeof record.symptoms === "string" &&
    typeof record.facility === "string" &&
    typeof record.registeredAt === "string"
  );
}

/** Read every patient registered by ASHA workers. */
export function getAshaPatients(): AshaPatient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ASHA_PATIENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAshaPatient);
  } catch {
    return [];
  }
}

/** Persist a newly registered patient (newest first). */
export function registerPatient(patient: AshaPatient): void {
  if (typeof window === "undefined") return;
  const current = getAshaPatients().filter((item) => item.id !== patient.id);
  window.localStorage.setItem(
    ASHA_PATIENTS_KEY,
    JSON.stringify([patient, ...current])
  );
}

/** Mark a patient as referred (used by the "Refer to Doctor" action). */
export function markAshaReferred(id: string, date: string): void {
  if (typeof window === "undefined") return;
  const current = getAshaPatients().map((patient) =>
    patient.id === id ? { ...patient, referredAt: date } : patient
  );
  window.localStorage.setItem(ASHA_PATIENTS_KEY, JSON.stringify(current));
}