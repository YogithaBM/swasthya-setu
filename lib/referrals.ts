export type ReferralStatus = "Pending" | "In-Transit" | "Completed";

export interface Referral {
  id: string;
  patientName: string;
  /** Facility id the patient is being referred FROM. */
  fromFacility: string;
  /** Facility id the patient is being referred TO. */
  toFacility: string;
  /** YYYY-MM-DD */
  date: string;
  status: ReferralStatus;
  reason: string;
}

export const REFERRALS_STORAGE_KEY = "swasthya_referrals";

const REFERRAL_STATUSES: ReferralStatus[] = ["Pending", "In-Transit", "Completed"];

function isReferral(value: unknown): value is Referral {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.patientName === "string" &&
    typeof record.fromFacility === "string" &&
    typeof record.toFacility === "string" &&
    typeof record.date === "string" &&
    typeof record.reason === "string" &&
    REFERRAL_STATUSES.includes(record.status as ReferralStatus)
  );
}

/** Read all referrals from localStorage. */
export function getReferrals(): Referral[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REFERRALS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReferral);
  } catch {
    return [];
  }
}

/** Persist a new referral (newest first in storage). */
export function addReferral(referral: Referral): void {
  if (typeof window === "undefined") return;
  const current = getReferrals().filter((item) => item.id !== referral.id);
  window.localStorage.setItem(
    REFERRALS_STORAGE_KEY,
    JSON.stringify([referral, ...current])
  );
}

/** Change a referral's status (used by the referral tracking page). */
export function updateReferralStatus(id: string, status: ReferralStatus): void {
  if (typeof window === "undefined") return;
  const current = getReferrals().map((referral) =>
    referral.id === id ? { ...referral, status } : referral
  );
  window.localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(current));
}