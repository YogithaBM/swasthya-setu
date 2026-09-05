export interface Followup {
  id: string;
  patientName: string;
  diagnosis: string;
  /** YYYY-MM-DD */
  followUpDate: string;
  /** Facility id from lib/data (where the patient was seen). */
  facility: string;
  /** YYYY-MM-DD (when the follow-up was scheduled). */
  createdAt: string;
}

export const FOLLOWUPS_STORAGE_KEY = "swasthya_followups";

function isFollowup(value: unknown): value is Followup {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.patientName === "string" &&
    typeof record.diagnosis === "string" &&
    typeof record.followUpDate === "string" &&
    typeof record.facility === "string"
  );
}

/** Read all scheduled follow-ups from localStorage. */
export function getFollowups(): Followup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FOLLOWUPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFollowup);
  } catch {
    return [];
  }
}

/** Persist a new follow-up (newest first in storage). */
export function addFollowup(followup: Followup): void {
  if (typeof window === "undefined") return;
  const current = getFollowups().filter((item) => item.id !== followup.id);
  window.localStorage.setItem(
    FOLLOWUPS_STORAGE_KEY,
    JSON.stringify([followup, ...current])
  );
}