export type EmergencyStatus = "escalated" | "resolved";

export interface Emergency {
  id: string;
  /** Patient name if known; "Anonymous" for quick triage without login. */
  patientName: string;
  /** 10-digit mobile if known; "" for anonymous walk-in triage. */
  phone: string;
  /** Raw symptom text that triggered the red-severity triage. */
  symptoms: string;
  /** ISO timestamp of the escalation. */
  timestamp: string;
  /** Facility id from lib/data the case was escalated to. */
  facility: string;
  status: EmergencyStatus;
}

export const EMERGENCIES_STORAGE_KEY = "swasthya_emergencies";

function isEmergency(value: unknown): value is Emergency {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.patientName === "string" &&
    typeof record.phone === "string" &&
    typeof record.symptoms === "string" &&
    typeof record.timestamp === "string" &&
    typeof record.facility === "string" &&
    (record.status === "escalated" || record.status === "resolved")
  );
}

/** Read all escalated emergencies from localStorage (newest first). */
export function getEmergencies(): Emergency[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EMERGENCIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEmergency);
  } catch {
    return [];
  }
}

/** Persist a new emergency (newest first in storage). */
export function addEmergency(emergency: Emergency): void {
  if (typeof window === "undefined") return;
  const current = getEmergencies().filter((item) => item.id !== emergency.id);
  window.localStorage.setItem(
    EMERGENCIES_STORAGE_KEY,
    JSON.stringify([emergency, ...current])
  );
}

/** Flip an emergency between escalated / resolved. */
export function updateEmergencyStatus(
  id: string,
  status: EmergencyStatus
): void {
  if (typeof window === "undefined") return;
  const current = getEmergencies().map((emergency) =>
    emergency.id === id ? { ...emergency, status } : emergency
  );
  window.localStorage.setItem(EMERGENCIES_STORAGE_KEY, JSON.stringify(current));
}

/** Emergencies linked to a patient phone (newest first). */
export function getEmergenciesByPhone(phone: string): Emergency[] {
  const needle = phone.trim();
  return getEmergencies().filter(
    (emergency) => emergency.phone === needle
  );
}
