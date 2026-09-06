"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BedDouble,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  FileLock2,
  HeartHandshake,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Microscope,
  Moon,
  Siren,
  Stethoscope,
  Sun,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { NAV_ROUTES, type Role } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
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

/** Desktop navbar: routes that render as normal top-level links. */
const TOP_LEVEL_HREFS = new Set([
  "/",
  "/triage",
  "/facilities",
  "/availability",
  "/appointments",
  "/doctor",
  "/asha",
]);

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
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  const items: NavEntry[] = NAV_ROUTES[role]
    .map((href) => {
      const entry = NAV_BY_HREF[href];
      return entry ? { href, ...entry } : null;
    })
    .filter((entry): entry is NavEntry => Boolean(entry));

  const topItems = items.filter((item) => TOP_LEVEL_HREFS.has(item.href));
  const moreItems = items.filter((item) => !TOP_LEVEL_HREFS.has(item.href));
  const moreActive = moreItems.some((item) => pathname === item.href);

  // Close the More dropdown on outside click / Escape.
  useEffect(() => {
    if (!moreOpen) return;
    function handlePointer(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [moreOpen]);

  // Close the dropdown whenever the route changes.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  function toggleLanguage() {
    const next = lang === "hi" ? "en" : "hi";
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-teal-500/90 text-white shadow-sm shadow-teal-500/30"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/40 bg-white/70 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/30">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-md shadow-teal-600/30">
            <HeartPulse className="h-5 w-5 text-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {t.appName}
            </span>
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block dark:text-slate-400">
              {t.appNameRoman} · Health Bridge
            </span>
          </span>
        </Link>

        {/* Center nav links (desktop) — inline + "More ▾" for the rest */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {topItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={linkClass(isActive)}>
                <Icon className={`h-4 w-4 ${isActive ? "" : "text-slate-600 dark:text-slate-400"}`} />
                {t.nav[item.labelKey]}
              </Link>
            );
          })}

          {moreItems.length > 0 && (
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={linkClass(moreActive)}
              >
                {t.nav.moreMenu}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl bg-white/90 py-1.5 shadow-xl ring-1 ring-slate-200 backdrop-blur-xl dark:bg-slate-800/95 dark:ring-white/10"
                >
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300"
                            : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/5"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? "text-teal-700 dark:text-teal-300" : "text-slate-400"}`} />
                        {t.nav[item.labelKey]}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          {role === "doctor" && (
            <span
              title={t.doctor.doctorLabel}
              className="hidden items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1.5 text-xs font-bold text-teal-700 ring-1 ring-teal-500/30 sm:inline-flex dark:text-teal-300"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              {t.doctor.doctorName}
            </span>
          )}

          {/* Theme toggle — sun/moon, next to the language toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={t.theme}
            aria-label={t.theme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onLogout}
            title={t.logout}
            aria-label={t.logout}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white/60 px-3 text-xs font-bold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>

          <button
            type="button"
            onClick={toggleLanguage}
            title={t.switchTo}
            aria-label={`${t.language}: ${lang === "hi" ? "हिन्दी" : "English"}. ${t.switchTo}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 px-3.5 text-xs font-extrabold text-white shadow-md shadow-teal-600/25 transition hover:shadow-lg"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 lg:hidden dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="max-h-[calc(100vh-4rem)] space-y-1 overflow-y-auto border-t border-slate-200/70 bg-white/85 px-4 pb-4 pt-2 shadow-xl backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-slate-900/95">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-teal-500/90 text-white shadow-sm shadow-teal-500/30"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{t.nav[item.labelKey]}</span>
                {isActive && (
                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-teal-400" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
