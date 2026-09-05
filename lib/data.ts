export type FacilityLevel =
  | "sub_centre"
  | "phc"
  | "rural_hospital"
  | "district_hospital";

export interface BedCategory {
  total: number;
  available: number;
}

export interface BedInventory {
  general: BedCategory;
  icu: BedCategory;
  maternity: BedCategory;
}

export interface MedicineStock {
  name: string;
  unit: string;
  /** Units currently in stock. */
  stock: number;
  /** At or below this level, the medicine is considered low stock. */
  threshold: number;
}

export interface HealthFacility {
  id: string;
  name: string;
  level: FacilityLevel;
  district: string;
  lat: number;
  lng: number;
  doctorCount: number;
  beds: BedInventory;
  medicines: MedicineStock[];
}

export const facilities: HealthFacility[] = [
  {
    id: "shelgaon-sub-centre",
    name: "Shelgaon Sub-Centre",
    level: "sub_centre",
    district: "Amravati",
    lat: 20.9,
    lng: 77.7,
    doctorCount: 1,
    beds: {
      general: { total: 4, available: 2 },
      icu: { total: 0, available: 0 },
      maternity: { total: 2, available: 1 },
    },
    medicines: [
      { name: "Paracetamol 500mg", unit: "tablets", stock: 500, threshold: 150 },
      { name: "ORS Sachet", unit: "sachets", stock: 120, threshold: 50 },
      { name: "Zinc Tablets", unit: "tablets", stock: 90, threshold: 40 },
      { name: "Iron & Folic Acid", unit: "tablets", stock: 200, threshold: 80 },
      { name: "Albendazole 400mg", unit: "tablets", stock: 60, threshold: 30 },
      { name: "Cetirizine 10mg", unit: "tablets", stock: 75, threshold: 40 },
    ],
  },
  {
    id: "anjangaon-phc",
    name: "Anjangaon PHC",
    level: "phc",
    district: "Amravati",
    lat: 21.2,
    lng: 77.3,
    doctorCount: 3,
    beds: {
      general: { total: 30, available: 12 },
      icu: { total: 0, available: 0 },
      maternity: { total: 10, available: 4 },
    },
    medicines: [
      { name: "Paracetamol 500mg", unit: "tablets", stock: 1500, threshold: 300 },
      { name: "Amoxicillin 250mg", unit: "capsules", stock: 800, threshold: 200 },
      { name: "ORS Sachet", unit: "sachets", stock: 400, threshold: 100 },
      { name: "Metformin 500mg", unit: "tablets", stock: 600, threshold: 150 },
      { name: "TT Vaccine", unit: "vials", stock: 40, threshold: 20 },
      { name: "Iron & Folic Acid", unit: "tablets", stock: 500, threshold: 150 },
    ],
  },
  {
    id: "badnera-rural-hospital",
    name: "Badnera Rural Hospital",
    level: "rural_hospital",
    district: "Amravati",
    lat: 20.9,
    lng: 77.8,
    doctorCount: 6,
    beds: {
      general: { total: 60, available: 22 },
      icu: { total: 6, available: 2 },
      maternity: { total: 20, available: 6 },
    },
    medicines: [
      { name: "Paracetamol 500mg", unit: "tablets", stock: 2000, threshold: 400 },
      { name: "Amoxicillin 250mg", unit: "capsules", stock: 1200, threshold: 250 },
      { name: "IV Fluids (NS 500ml)", unit: "bottles", stock: 90, threshold: 30 },
      { name: "Metformin 500mg", unit: "tablets", stock: 700, threshold: 150 },
      { name: "Rabies Vaccine", unit: "vials", stock: 25, threshold: 10 },
      { name: "Cotrimoxazole", unit: "tablets", stock: 400, threshold: 120 },
      { name: "ORS Sachet", unit: "sachets", stock: 350, threshold: 80 },
    ],
  },
  {
    id: "amravati-district-hospital",
    name: "Amravati District Hospital",
    level: "district_hospital",
    district: "Amravati",
    lat: 20.94,
    lng: 77.75,
    doctorCount: 45,
    beds: {
      general: { total: 450, available: 120 },
      icu: { total: 40, available: 6 },
      maternity: { total: 120, available: 35 },
    },
    medicines: [
      { name: "Paracetamol 500mg", unit: "tablets", stock: 5000, threshold: 800 },
      { name: "Amoxicillin 250mg", unit: "capsules", stock: 3000, threshold: 500 },
      { name: "IV Fluids (NS 500ml)", unit: "bottles", stock: 400, threshold: 100 },
      { name: "Insulin (Mixtard)", unit: "vials", stock: 120, threshold: 40 },
      { name: "Amlodipine 5mg", unit: "tablets", stock: 1500, threshold: 300 },
      { name: "Ceftriaxone Injection", unit: "vials", stock: 300, threshold: 60 },
      { name: "ORS Sachet", unit: "sachets", stock: 900, threshold: 200 },
      { name: "Iron & Folic Acid", unit: "tablets", stock: 2500, threshold: 500 },
    ],
  },
  {
    id: "ashti-phc",
    name: "Ashti PHC",
    level: "phc",
    district: "Amravati",
    lat: 21.27,
    lng: 77.53,
    doctorCount: 2,
    beds: {
      general: { total: 30, available: 10 },
      icu: { total: 0, available: 0 },
      maternity: { total: 10, available: 5 },
    },
    medicines: [
      { name: "Paracetamol 500mg", unit: "tablets", stock: 900, threshold: 250 },
      { name: "ORS Sachet", unit: "sachets", stock: 250, threshold: 80 },
      { name: "Zinc Tablets", unit: "tablets", stock: 180, threshold: 60 },
      { name: "Amoxicillin 250mg", unit: "capsules", stock: 500, threshold: 150 },
      { name: "Albendazole 400mg", unit: "tablets", stock: 100, threshold: 40 },
    ],
  },
  {
    id: "daryapur-rural-hospital",
    name: "Daryapur Rural Hospital",
    level: "rural_hospital",
    district: "Amravati",
    lat: 20.92,
    lng: 77.07,
    doctorCount: 5,
    beds: {
      general: { total: 50, available: 18 },
      icu: { total: 4, available: 1 },
      maternity: { total: 16, available: 7 },
    },
    medicines: [
      { name: "Paracetamol 500mg", unit: "tablets", stock: 1600, threshold: 350 },
      { name: "Amoxicillin 250mg", unit: "capsules", stock: 900, threshold: 220 },
      { name: "IV Fluids (NS 500ml)", unit: "bottles", stock: 60, threshold: 25 },
      { name: "Metformin 500mg", unit: "tablets", stock: 500, threshold: 120 },
      { name: "Rabies Vaccine", unit: "vials", stock: 18, threshold: 8 },
      { name: "TT Vaccine", unit: "vials", stock: 55, threshold: 20 },
    ],
  },
];

export function getFacilityById(id: string): HealthFacility | undefined {
  return facilities.find((facility) => facility.id === id);
}

export function totalBeds(facility: HealthFacility): number {
  return (
    facility.beds.general.total +
    facility.beds.icu.total +
    facility.beds.maternity.total
  );
}

export function availableBeds(facility: HealthFacility): number {
  return (
    facility.beds.general.available +
    facility.beds.icu.available +
    facility.beds.maternity.available
  );
}

/** Percentage of beds currently occupied (0-100). */
export function occupancyRate(facility: HealthFacility): number {
  const total = totalBeds(facility);
  if (total === 0) return 0;
  return Math.round(((total - availableBeds(facility)) / total) * 100);
}

export function isLowStock(medicine: MedicineStock): boolean {
  return medicine.stock <= medicine.threshold;
}

/** Pin/legend color per facility level (Facilities map page). */
export const LEVEL_COLORS: Record<FacilityLevel, string> = {
  sub_centre: "#1d4ed8", // blue
  phc: "#059669", // green
  rural_hospital: "#ea580c", // orange
  district_hospital: "#dc2626", // red
};

export type BedFreeStatus = "good" | "fair" | "low";

/** Free-bed percentage (0-100) for a bed category; null when it has no beds. */
export function freePercent(category: BedCategory): number | null {
  if (category.total <= 0) return null;
  return Math.round((category.available / category.total) * 100);
}

/** Color band for a free-bed percentage (>50 good, 25-50 fair, <25 low). */
export function bedStatusKey(free: number): BedFreeStatus {
  if (free > 50) return "good";
  if (free >= 25) return "fair";
  return "low";
}