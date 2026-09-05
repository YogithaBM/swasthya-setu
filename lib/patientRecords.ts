export interface RecordMedicine {
  name: string;
  dosage: string;
  /** Frequency key ("once" | "twice" | "thrice" | "asNeeded") or a free-text label. */
  frequency: string;
  duration: string;
}

export interface PatientRecord {
  id: string;
  patientName: string;
  phone: string;
  /** YYYY-MM-DD */
  date: string;
  diagnosis: string;
  medicines: RecordMedicine[];
  severity: "green" | "yellow" | "red";
  doctorNotes: string;
  /** Facility id from lib/data (where the patient was seen). */
  facility: string;
}

export const PATIENT_RECORDS_KEY = "swasthya_patient_records";

function isPatientRecord(value: unknown): value is PatientRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.patientName === "string" &&
    typeof record.date === "string" &&
    typeof record.diagnosis === "string" &&
    Array.isArray(record.medicines) &&
    (record.severity === "green" ||
      record.severity === "yellow" ||
      record.severity === "red") &&
    typeof record.facility === "string"
  );
}

/** Read every saved prescription record from localStorage. */
export function getPatientRecords(): PatientRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PATIENT_RECORDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPatientRecord);
  } catch {
    return [];
  }
}

/** Persist a prescription record (newest first in storage). */
export function saveRecord(record: PatientRecord): void {
  if (typeof window === "undefined") return;
  const current = getPatientRecords().filter((item) => item.id !== record.id);
  window.localStorage.setItem(
    PATIENT_RECORDS_KEY,
    JSON.stringify([record, ...current])
  );
}

/**
 * Past visit history for a patient, newest first.
 * Matches by name (case-insensitive); when a phone is given and the record
 * carries a phone, the phone must match too.
 */
export function getPatientHistory(
  name: string,
  phone?: string
): PatientRecord[] {
  const needle = name.trim().toLowerCase();
  return getPatientRecords()
    .filter((record) => {
      if (record.patientName.trim().toLowerCase() !== needle) return false;
      if (phone && record.phone) return record.phone === phone;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}