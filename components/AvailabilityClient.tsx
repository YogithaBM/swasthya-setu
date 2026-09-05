"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  Pill,
  RefreshCw,
  Send,
  Timer,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  availableBeds,
  bedStatusKey,
  facilities,
  freePercent,
  LEVEL_COLORS,
  occupancyRate,
  totalBeds,
  type BedCategory,
  type HealthFacility,
} from "@/lib/data";
import { getAppointments } from "@/lib/appointments";
import { getAshaPatients } from "@/lib/ashaPatients";
import { getFollowups } from "@/lib/followups";
import { getReferrals } from "@/lib/referrals";
import { getTranslations, translations, type Language } from "@/lib/translations";

const BED_CATEGORIES = ["general", "icu", "maternity"] as const;

const BED_BOX_STYLES: Record<string, string> = {
  good: "bg-emerald-100/70 text-emerald-900 ring-emerald-200",
  fair: "bg-amber-100/70 text-amber-900 ring-amber-200",
  low: "bg-red-100/70 text-red-900 ring-red-200",
  na: "bg-slate-100 text-slate-400 ring-slate-200",
};

const BED_STATUS_DOTS: Record<string, string> = {
  good: "bg-emerald-500",
  fair: "bg-amber-500",
  low: "bg-red-500",
};

type MedicineStatus = "in" | "low" | "out";

const STATUS_EMOJI: Record<MedicineStatus, string> = {
  in: "✅",
  low: "⚠️",
  out: "❌",
};

const STATUS_STYLES: Record<MedicineStatus, string> = {
  in: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  low: "bg-amber-50 text-amber-800 ring-amber-200",
  out: "bg-red-50 text-red-800 ring-red-200",
};

const STATUS_RANK: Record<MedicineStatus, number> = { in: 0, low: 1, out: 2 };

type SortKey = "medicine" | "facility" | "stock" | "status";

interface StockRow {
  facilityId: string;
  facilityName: string;
  medicineName: string;
  unit: string;
  stock: number;
  status: MedicineStatus;
}

function medicineStatus(stock: number): MedicineStatus {
  if (stock > 50) return "in";
  if (stock >= 20) return "low";
  return "out";
}

/* ------------------------------------------------------------------ */
/* Facility-dashboard helpers                                         */
/* ------------------------------------------------------------------ */

type CardTone = "good" | "fair" | "critical";

const TONE_CHIP: Record<CardTone, string> = {
  good: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  fair: "bg-amber-100 text-amber-800 ring-amber-300",
  critical: "bg-red-100 text-red-800 ring-red-300",
};

const TONE_RING: Record<CardTone, string> = {
  good: "ring-emerald-200",
  fair: "ring-amber-200",
  critical: "ring-red-200",
};

const TONE_DOT: Record<CardTone, string> = {
  good: "bg-emerald-500",
  fair: "bg-amber-500",
  critical: "bg-red-500",
};

/** Average "fill level" of the facility's medicine shelf (stock vs. a working capacity of 2x the re-order threshold). */
function medFillPercent(facility: HealthFacility): number {
  if (facility.medicines.length === 0) return 100;
  const fills = facility.medicines.map((medicine) =>
    Math.min(100, Math.round((medicine.stock / (medicine.threshold * 2)) * 100))
  );
  return Math.round(fills.reduce((sum, fill) => sum + fill, 0) / fills.length);
}

/**
 * Overall readiness tone for a facility card:
 * - critical: beds are more than 70% occupied (little surge headroom);
 * - good: half the beds are still free AND the medicine shelf is well stocked;
 * - otherwise fair (the attention band).
 */
function cardTone(facility: HealthFacility): CardTone {
  if (occupancyRate(facility) > 70) return "critical";
  const overall: BedCategory = {
    total: totalBeds(facility),
    available: availableBeds(facility),
  };
  const free = freePercent(overall);
  if (free !== null && free >= 50 && medFillPercent(facility) >= 80) return "good";
  return "fair";
}

/** Deterministic pseudo-random "patients served today" (10-50) so refreshes don't flicker. */
function seededNumber(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

function occupancyBarColor(occupancy: number): string {
  if (occupancy > 70) return "bg-red-500";
  if (occupancy > 50) return "bg-amber-400";
  return "bg-emerald-500";
}

/** Sample footfall per weekday (Sun..Sat), 20-80 patients per day. */
const WEEK_PATIENTS: Record<number, number> = {
  0: 58, // Sun
  1: 46, // Mon
  2: 63, // Tue
  3: 39, // Wed
  4: 55, // Thu
  5: 72, // Fri
  6: 41, // Sat
};

function weekChartData(lang: Language): { label: string; patients: number }[] {
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const today = new Date();
  const rows: { label: string; patients: number }[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    rows.push({
      label: day.toLocaleDateString(locale, { weekday: "short" }),
      patients: WEEK_PATIENTS[day.getDay()],
    });
  }
  return rows;
}

interface LiveMetrics {
  avgWaitMin: number;
  patientsToday: number;
  referralsCompleted: number;
  followupsDue: number;
}

function localDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Quality metrics pulled from the live localStorage stores shared with the other pages. */
function computeLiveMetrics(): LiveMetrics {
  const appointments = getAppointments();
  const waiting = appointments.filter(
    (appointment) => appointment.status === "Waiting" && appointment.queueNumber > 0
  );
  const avgQueue = waiting.length
    ? Math.round(
        waiting.reduce((sum, appointment) => sum + appointment.queueNumber, 0) /
          waiting.length
      )
    : 0;

  const today = localDateString(new Date());
  // Sample bookings use an empty date and are treated as "today's queue".
  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === "" || appointment.date === today
  ).length;
  const todayAsha = getAshaPatients().filter(
    (patient) => patient.registeredAt === today
  ).length;

  return {
    avgWaitMin: avgQueue * 5,
    patientsToday: todayAppointments + todayAsha,
    referralsCompleted: getReferrals().filter(
      (referral) => referral.status === "Completed"
    ).length,
    followupsDue: getFollowups().filter(
      (followup) => followup.followUpDate <= today
    ).length,
  };
}

/**
 * Demo telemetry for the alert strip. In a live deployment this array would be
 * streamed from bed/sensor feeds and the pharmacy system (e.g. ICU occupancy
 * crossing its surge threshold, or a medicine dropping under its re-order
 * level). Set it to [] to exercise the green "all operational" state.
 */
const DEMO_ALERTS: {
  facilityId: string;
  tone: "red" | "yellow";
  key: "alertIcu" | "alertStock";
}[] = [
  { facilityId: "amravati-district-hospital", tone: "red", key: "alertIcu" },
  { facilityId: "badnera-rural-hospital", tone: "yellow", key: "alertStock" },
];

const ALERT_ROW_STYLES: Record<"red" | "yellow", string> = {
  red: "bg-red-50 text-red-800 ring-red-200",
  yellow: "bg-amber-50 text-amber-900 ring-amber-200",
};

export default function AvailabilityClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].availability.title;

  const [facilityFilter, setFacilityFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("medicine");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [live, setLive] = useState<LiveMetrics>({
    avgWaitMin: 0,
    patientsToday: 0,
    referralsCompleted: 0,
    followupsDue: 0,
  });

  // Hydration-safe: compute the store-backed metrics only on the client.
  useEffect(() => {
    setLive(computeLiveMetrics());
  }, []);

  const stats = useMemo(
    () => ({
      totalBeds: facilities.reduce((sum, f) => sum + totalBeds(f), 0),
      availableBeds: facilities.reduce((sum, f) => sum + availableBeds(f), 0),
      medicineUnits: facilities.reduce(
        (sum, f) => sum + f.medicines.reduce((s, m) => s + m.stock, 0),
        0
      ),
      lowStock: facilities.reduce(
        (sum, f) =>
          sum + f.medicines.filter((medicine) => medicine.stock < 50).length,
        0
      ),
    }),
    []
  );

  const weekData = useMemo(() => weekChartData(lang), [lang]);

  const rows = useMemo<StockRow[]>(() => {
    const selected = facilityFilter
      ? facilities.filter((f) => f.id === facilityFilter)
      : facilities;
    return selected.flatMap((facility) =>
      facility.medicines.map((medicine) => ({
        facilityId: facility.id,
        facilityName: facility.name,
        medicineName: medicine.name,
        unit: medicine.unit,
        stock: medicine.stock,
        status: medicineStatus(medicine.stock),
      }))
    );
  }, [facilityFilter]);

  const maxStock = useMemo(
    () => Math.max(1, ...rows.map((row) => row.stock)),
    [rows]
  );

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "medicine":
          cmp = a.medicineName.localeCompare(b.medicineName);
          break;
        case "facility":
          cmp = a.facilityName.localeCompare(b.facilityName);
          break;
        case "stock":
          cmp = a.stock - b.stock;
          break;
        case "status":
          cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status];
          if (cmp === 0) cmp = a.stock - b.stock;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    setUpdated(false);
    // Simulate a telemetry poll round-trip, then re-read the live stores.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLive(computeLiveMetrics());
    setRefreshing(false);
    setUpdated(true);
    setTimeout(() => setUpdated(false), 2000);
  }

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "medicine", label: t.availability.colMedicine },
    { key: "facility", label: t.availability.colFacility },
    { key: "stock", label: t.availability.colStock },
    { key: "status", label: t.availability.colStatus },
  ];

  const statCards = [
    {
      icon: <BedDouble className="h-6 w-6" />,
      accent: "bg-blue-100 text-blue-800",
      value: stats.totalBeds.toLocaleString("en-IN"),
      label: t.availability.totalBeds,
      sub: null as string | null,
    },
    {
      icon: <BedDouble className="h-6 w-6" />,
      accent: "bg-emerald-100 text-emerald-700",
      value: stats.availableBeds.toLocaleString("en-IN"),
      label: t.availability.availableBeds,
      sub: null,
    },
    {
      icon: <Pill className="h-6 w-6" />,
      accent: "bg-teal-100 text-teal-700",
      value: stats.medicineUnits.toLocaleString("en-IN"),
      label: t.availability.totalMedicines,
      sub: t.availability.unitsInStock,
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      accent: "bg-red-100 text-red-700",
      value: stats.lowStock.toLocaleString("en-IN"),
      label: t.availability.lowStockAlerts,
      sub: null,
    },
  ];

  const qualityCards = [
    {
      icon: <Timer className="h-6 w-6" />,
      accent: "bg-blue-100 text-blue-800",
      value: String(live.avgWaitMin),
      unit: t.availability.dashboard.minutesShort,
      label: t.availability.dashboard.avgWait,
    },
    {
      icon: <Users className="h-6 w-6" />,
      accent: "bg-emerald-100 text-emerald-700",
      value: live.patientsToday.toLocaleString("en-IN"),
      unit: "",
      label: t.availability.dashboard.patientsToday,
    },
    {
      icon: <Send className="h-6 w-6" />,
      accent: "bg-teal-100 text-teal-700",
      value: live.referralsCompleted.toLocaleString("en-IN"),
      unit: "",
      label: t.availability.dashboard.referralsCompleted,
    },
    {
      icon: <CalendarClock className="h-6 w-6" />,
      accent: "bg-violet-100 text-violet-700",
      value: live.followupsDue.toLocaleString("en-IN"),
      unit: "",
      label: t.availability.dashboard.followupsDue,
    },
  ];

  const toneLabel = (tone: CardTone) => {
    if (tone === "good") return t.availability.dashboard.statusHealthy;
    if (tone === "fair") return t.availability.dashboard.statusAttention;
    return t.availability.dashboard.statusCritical;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      {/* Live alert strip */}
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            {t.availability.dashboard.alertsTitle}
          </h2>
        </div>
        {DEMO_ALERTS.length === 0 ? (
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            {t.availability.dashboard.allOperational}
          </div>
        ) : (
          <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
            {DEMO_ALERTS.map((alert) => {
              const facility = facilities.find((f) => f.id === alert.facilityId);
              const name = facility ? facility.name : alert.facilityId;
              const message =
                alert.key === "alertIcu"
                  ? t.availability.dashboard.alertIcu
                  : t.availability.dashboard.alertStock;
              return (
                <div
                  key={alert.facilityId}
                  className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold ring-1 ${ALERT_ROW_STYLES[alert.tone]}`}
                >
                  <span className="shrink-0">⚠️</span>
                  <span>
                    {name}: {message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
            <Activity className="h-4 w-4" />
            {t.availability.badge}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
            {t.availability.title}
          </h1>
          <p className="mt-2 text-lg font-bold text-blue-800 md:text-2xl">{otherTitle}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
            {t.availability.description}
          </p>
        </div>

        {/* Refresh */}
        <div className="flex items-center gap-3 md:pt-8">
          {updated && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              ✓ {t.availability.updated}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-800/25 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? t.availability.refreshing : t.availability.refreshData}
          </button>
        </div>
      </div>

      {/* Quality metrics row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {qualityCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}
            >
              {card.icon}
            </div>
            <p className="mt-4 flex items-baseline gap-1.5 text-3xl font-extrabold tracking-tight text-slate-800">
              {card.value}
              {card.unit && (
                <span className="text-sm font-bold text-slate-400">{card.unit}</span>
              )}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Facility health cards */}
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              <Activity className="h-5 w-5 text-blue-800" />
              {t.availability.dashboard.facilityHealth}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {t.availability.dashboard.facilityHealthSub}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {(["good", "fair", "critical"] as CardTone[]).map((tone) => (
              <span
                key={tone}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[tone]}`} />
                {toneLabel(tone)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {facilities.map((facility) => {
            const occupancy = occupancyRate(facility);
            const medicineFill = medFillPercent(facility);
            const served = seededNumber(`${facility.id}-served`, 10, 50);
            const tone = cardTone(facility);
            return (
              <div
                key={facility.id}
                className={`rounded-2xl bg-slate-50 p-5 ring-1 ${TONE_RING[tone]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold leading-snug text-slate-800">
                      {facility.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: LEVEL_COLORS[facility.level] }}
                      />
                      {t.levels[facility.level]}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${TONE_CHIP[tone]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
                    {toneLabel(tone)}
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">
                        {t.availability.dashboard.bedOccupancy}
                      </span>
                      <span className="text-slate-800">{occupancy}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className={`h-full rounded-full ${occupancyBarColor(occupancy)}`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">
                        {t.availability.dashboard.medicineStock}
                      </span>
                      <span className="text-slate-800">{medicineFill}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${medicineFill}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-3.5">
                  <span className="text-xs font-bold text-slate-500">
                    {t.availability.dashboard.patientsServed}
                  </span>
                  <span className="text-2xl font-extrabold leading-none text-blue-800">
                    {served}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patients this week — chart */}
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              {t.availability.dashboard.weekTitle}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {t.availability.dashboard.weekSub}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-800 ring-1 ring-blue-100">
            {t.availability.dashboard.patientsUnit}
          </span>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#eff6ff" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                  fontWeight: 600,
                }}
                formatter={(value) => [
                  `${value}`,
                  t.availability.dashboard.patientsUnit,
                ]}
              />
              <Bar dataKey="patients" radius={[6, 6, 0, 0]} maxBarSize={46}>
                {weekData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.label}`}
                    fill={index === weekData.length - 1 ? "#059669" : "#1e40af"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}
            >
              {card.icon}
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800">
              {card.value}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-500">{card.label}</p>
            {card.sub && <p className="text-xs text-slate-400">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Bed grid */}
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              <BedDouble className="h-5 w-5 text-blue-800" />
              {t.availability.bedGridTitle}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.availability.bedGridSub}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.facilities.bedsFree}:
            </span>
            {(
              [
                ["good", t.facilities.legendGood],
                ["fair", t.facilities.legendFair],
                ["low", t.facilities.legendLow],
              ] as const
            ).map(([status, label]) => (
              <span
                key={status}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${BED_STATUS_DOTS[status]}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {facilities.map((facility) => {
            const overall: BedCategory = {
              total: totalBeds(facility),
              available: availableBeds(facility),
            };
            const overallFree = freePercent(overall);
            const overallStatus = overallFree === null ? "na" : bedStatusKey(overallFree);
            return (
              <div
                key={facility.id}
                className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold leading-snug text-slate-800">
                      {facility.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: LEVEL_COLORS[facility.level] }}
                      />
                      {t.levels[facility.level]}
                    </p>
                  </div>
                  {overallFree !== null && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${
                        BED_BOX_STYLES[overallStatus]
                      }`}
                    >
                      {overallFree}% {t.facilities.bedsFree}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {BED_CATEGORIES.map((category) => {
                    const bed = facility.beds[category];
                    const free = freePercent(bed);
                    const status = free === null ? "na" : bedStatusKey(free);
                    return (
                      <div
                        key={category}
                        className={`flex flex-col items-center rounded-xl px-2 py-3 text-center ring-1 ${BED_BOX_STYLES[status]}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                          {t.bedTypes[category]}
                        </span>
                        <span className="mt-1 text-sm font-extrabold">
                          {bed.available}/{bed.total}
                        </span>
                        <span className="text-[10px] font-semibold opacity-70">
                          {free === null ? "—" : `${free}% ${t.facilities.bedsFree}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medicine stock table */}
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              <Pill className="h-5 w-5 text-emerald-600" />
              {t.availability.medicineStockTitle}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.availability.medicineStockSub}</p>
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            {t.stats.facilities}
            <select
              value={facilityFilter}
              onChange={(event) => setFacilityFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            >
              <option value="">{t.availability.allFacilities}</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400">
                {columns.map((column) => (
                  <th key={column.key} className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={`inline-flex items-center gap-1 font-bold transition hover:text-blue-800 ${
                        sortKey === column.key ? "text-blue-800" : ""
                      }`}
                    >
                      {column.label}
                      {sortIcon(column.key)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={`${row.facilityId}-${row.medicineName}`}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-emerald-50/30"
                >
                  <td className="px-3 py-3">
                    <p className="font-extrabold text-slate-800">{row.medicineName}</p>
                    <p className="text-xs text-slate-400">{row.unit}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-bold text-slate-600">
                      {row.facilityName}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="max-w-[140px]">
                      <span className="font-extrabold text-slate-700">{row.stock}</span>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-700"
                          style={{
                            width: `${Math.max(3, (row.stock / maxStock) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATUS_STYLES[row.status]}`}
                    >
                      {STATUS_EMOJI[row.status]}{" "}
                      {row.status === "in"
                        ? t.availability.statusInStock
                        : row.status === "low"
                          ? t.availability.statusLow
                          : t.availability.statusOut}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-400">
                      {t.availability.noResults}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
