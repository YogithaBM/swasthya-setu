"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BedDouble,
  Building2,
  CalendarClock,
  CalendarDays,
  FileLock2,
  HeartHandshake,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Microscope,
  Siren,
  Stethoscope,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { NAV_ROUTES, type Role } from "@/lib/auth";
import {
  getTranslations,
  translations,
  type Language,
  type Translation,
} from "@/lib/translations";

interface NavEntry {
  href: string;
  labelKey: keyof Translation["nav"];
  icon: LucideIcon;
}

/** All possible destinations; each role only sees the subset it may visit. */
const NAV_BY_HREF: Record<string, Omit<NavEntry, "href">> = {
  "/": { labelKey: "home", icon: Home },
  "/triage": { labelKey: "triage", icon: Stethoscope },
  "/facilities": { labelKey: "facilities", icon: Building2 },
  "/availability": { labelKey: "availability", icon: BedDouble },
  "/appointments": { labelKey: "appointments", icon: CalendarDays },
  "/doctor": { labelKey: "doctor", icon: UserRound },
  "/followup": { labelKey: "followups", icon: CalendarClock },
  "/referrals": { labelKey: "referrals", icon: ArrowLeftRight },
  "/lab-orders": { labelKey: "labOrders", icon: Microscope },
  "/escalation": { labelKey: "escalations", icon: Siren },
  "/my-records": { labelKey: "myRecords", icon: FileLock2 },
  "/asha": { labelKey: "asha", icon: HeartHandshake },
};

export default function TopNav({
  lang,
  role,
  onLogout,
}: {
  lang: Language;
  role: Role;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const t = getTranslations(lang);
  const [menuOpen, setMenuOpen] = useState(false);

  // Nav links follow the role's route order (Home first, then role pages).
  const items: NavEntry[] = NAV_ROUTES[role]
    .map((href) => {
      const entry = NAV_BY_HREF[href];
      return entry ? { href, ...entry } : null;
    })
    .filter((entry): entry is NavEntry => Boolean(entry));

  function toggleLanguage() {
    const next = lang === "hi" ? "en" : "hi";
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-blue-800 text-white shadow-lg shadow-blue-950/20">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-blue-950/30">
            <HeartPulse className="h-5 w-5 text-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold leading-none">
              {t.appName}
            </span>
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-blue-200 sm:block">
              {t.appNameRoman} · Health Bridge
            </span>
          </span>
        </Link>

        {/* Center nav links (desktop) */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-blue-100/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.nav[item.labelKey]}
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {role === "doctor" && (
            <span
              title={t.doctor.doctorLabel}
              className="hidden items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-100 ring-1 ring-emerald-400/40 sm:inline-flex"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              {t.doctor.doctorName}
            </span>
          )}

          <button
            type="button"
            onClick={onLogout}
            title={t.logout}
            aria-label={t.logout}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>

          <button
            type="button"
            onClick={toggleLanguage}
            title={t.switchTo}
            aria-label={`${t.language}: ${lang === "hi" ? "हिन्दी" : "English"}. ${t.switchTo}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-extrabold text-blue-900 shadow-sm transition hover:bg-blue-50 hover:shadow-md"
          >
            <span aria-hidden="true">🌐</span>
            {lang === "hi" ? "हिन्दी" : "English"}
          </button>

          {/* Hamburger (tablet & mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="border-t border-white/10 bg-blue-900 px-4 pb-4 pt-2 shadow-lg shadow-blue-950/30 lg:hidden">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`mt-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-blue-100/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.nav[item.labelKey]}
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
