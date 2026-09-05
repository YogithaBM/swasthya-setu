/** Common lab tests a doctor can order (labels shown as-is in both languages). */
export const LAB_TEST_OPTIONS = [
  "Blood CBC",
  "Blood Sugar",
  "Urine Test",
  "X-Ray",
  "ECG",
  "Liver Function",
  "Kidney Function",
  "Thyroid",
] as const;

export type LabStatus = "Pending" | "Sample Collected" | "Results Ready";

export const LAB_STATUSES: LabStatus[] = [
  "Pending",
  "Sample Collected",
  "Results Ready",
];

export interface LabOrder {
  id: string;
  patientName: string;
  /** Test names from LAB_TEST_OPTIONS. */
  tests: string[];
  /** Facility id from lib/data where the tests were ordered. */
  facility: string;
  /** YYYY-MM-DD */
  date: string;
  status: LabStatus;
}

export const LAB_ORDERS_KEY = "swasthya_lab_orders";

function isLabOrder(value: unknown): value is LabOrder {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.patientName === "string" &&
    Array.isArray(record.tests) &&
    record.tests.every((test) => typeof test === "string") &&
    typeof record.facility === "string" &&
    typeof record.date === "string" &&
    LAB_STATUSES.includes(record.status as LabStatus)
  );
}

/** Read all lab orders from localStorage (newest first). */
export function getLabOrders(): LabOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LAB_ORDERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLabOrder);
  } catch {
    return [];
  }
}

/** Persist a new lab order (newest first in storage). */
export function addLabOrder(order: LabOrder): void {
  if (typeof window === "undefined") return;
  const current = getLabOrders().filter((item) => item.id !== order.id);
  window.localStorage.setItem(
    LAB_ORDERS_KEY,
    JSON.stringify([order, ...current])
  );
}

/** Change an order's status (used by the lab orders page). */
export function updateLabOrderStatus(id: string, status: LabStatus): void {
  if (typeof window === "undefined") return;
  const current = getLabOrders().map((order) =>
    order.id === id ? { ...order, status } : order
  );
  window.localStorage.setItem(LAB_ORDERS_KEY, JSON.stringify(current));
}