export type Role = "patient" | "doctor" | "asha";

const ROLE_KEY = "swasthya_role";

/** Demo PINs (hardcoded for the demo). */
export const DOCTOR_PIN = "1234";
export const ASHA_PIN = "5678";
export const MAX_PIN_ATTEMPTS = 3;
export const PIN_LOCK_SECONDS = 30;

/** Routes that never require a role (public home, login, access-denied explainer). */
export const PUBLIC_PATHS = ["/", "/login", "/access-denied"];

/**
 * Which routes each role may visit. The array order also drives the order of
 * the navbar links for that role (Home first, then role-specific items).
 */
export const ROLE_ROUTES: Record<Role, string[]> = {
  patient: [
    "/",
    "/triage",
    "/facilities",
    "/availability",
    "/appointments",
    "/my-records",
  ],
  doctor: [
    "/",
    "/doctor",
    "/facilities",
    "/availability",
    "/followup",
    "/referrals",
    "/lab-orders",
    "/escalation",
  ],
  asha: [
    "/",
    "/triage",
    "/asha",
    "/facilities",
    "/availability",
    "/appointments",
  ],
};

/**
 * Which routes appear in the top navbar for each role (Home first).
 * Access is governed by ROLE_ROUTES; some reachable pages (e.g. the
 * appointments page for ASHA workers) stay out of the navbar.
 */
export const NAV_ROUTES: Record<Role, string[]> = {
  patient: [
    "/",
    "/triage",
    "/facilities",
    "/availability",
    "/appointments",
    "/my-records",
  ],
  doctor: [
    "/",
    "/doctor",
    "/facilities",
    "/availability",
    "/followup",
    "/referrals",
    "/lab-orders",
    "/escalation",
  ],
  asha: ["/", "/triage", "/asha", "/facilities", "/availability"],
};

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ROLE_KEY);
  return raw === "patient" || raw === "doctor" || raw === "asha" ? raw : null;
}

export function setRole(role: Role): void {
  window.localStorage.setItem(ROLE_KEY, role);
}

export function clearRole(): void {
  window.localStorage.removeItem(ROLE_KEY);
}

export function canAccess(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  // Logged-in users may always view the access-denied explainer.
  if (pathname === "/access-denied") return true;
  return ROLE_ROUTES[role].includes(pathname);
}

/** Where a freshly logged-in user should land. */
export function roleHome(role: Role): string {
  if (role === "doctor") return "/doctor";
  if (role === "asha") return "/asha";
  return "/";
}