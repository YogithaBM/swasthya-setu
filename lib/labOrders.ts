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

export type LabStatus = "Pending" | "Completed";

export const LAB_STATUSES: LabStatus[] = ["Pending", "Completed"];

/** One lab order = one test for one patient. */
export interface LabOrder {
  id: string;
  patientName: string;
  /** 10-digit mobile (links the order to the patient's self-records view). */
  phone: string;
  /** Test name from LAB_TEST_OPTIONS. */
  testName: string;
  /** YYYY-MM-DD (when the test was ordered). */
  dateOrdered: string;
  /** Facility id from lib/data where the tests were ordered. */
  facility: string;
  status: LabStatus;
  /** Mock result filled in when the order is marked complete. */
  result: string;
}

export const LAB_ORDERS_KEY = "swasthya_lab_orders";

function isLabOrder(value: unknown): value is LabOrder {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.patientName === "string" &&
    typeof record.phone === "string" &&
    typeof record.testName === "string" &&
    typeof record.dateOrdered === "string" &&
    typeof record.facility === "string" &&
    (record.status === "Pending" || record.status === "Completed") &&
    typeof record.result === "string"
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

/**
 * Mark an order complete and attach its (mock) result.
 * Results are demo data — realistic normal ranges per test type.
 */
const MOCK_RESULTS: Record<string, string> = {
  "Blood CBC": "Hemoglobin: 12.5 g/dL - Normal",
  "Blood Sugar": "Fasting glucose: 92 mg/dL - Normal",
  "Urine Test": "No protein, no infection - Normal",
  "X-Ray": "Chest clear, no abnormality detected",
  ECG: "Normal sinus rhythm, 72 bpm",
  "Liver Function": "SGPT: 28 U/L - Normal",
  "Kidney Function": "Creatinine: 0.9 mg/dL - Normal",
  Thyroid: "TSH: 2.1 mIU/L - Normal",
};

export function markLabOrderComplete(id: string): void {
  if (typeof window === "undefined") return;
  const current = getLabOrders().map((order) =>
    order.id === id
      ? {
          ...order,
          status: "Completed" as LabStatus,
          result: order.result || MOCK_RESULTS[order.testName] || "Result: Normal",
        }
      : order
  );
  window.localStorage.setItem(LAB_ORDERS_KEY, JSON.stringify(current));
}

/** Lab orders for a patient phone (newest first). */
export function getLabOrdersByPhone(phone: string): LabOrder[] {
  const needle = phone.trim();
  return getLabOrders().filter((order) => order.phone === needle);
}
