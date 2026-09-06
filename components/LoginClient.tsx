"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  HeartHandshake,
  HeartPulse,
  KeyRound,
  Lock,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import ClientLangToggle from "@/components/ClientLangToggle";
import {
  ASHA_PIN,
  DOCTOR_PIN,
  MAX_PIN_ATTEMPTS,
  PIN_LOCK_SECONDS,
  roleHome,
  setRole,
  type Role,
} from "@/lib/auth";
import { getTranslations, translations, type Language } from "@/lib/translations";

type PinRole = Extract<Role, "doctor" | "asha">;

interface LockState {
  locked: boolean;
  attempts: number;
  lockSeconds: number;
}

function readLock(lockKey: string): { locked: boolean; attempts: number; lockSeconds: number } {
  if (typeof window === "undefined") return { locked: false, attempts: 0, lockSeconds: 0 };
  const until = Number(window.localStorage.getItem(lockKey) ?? 0);
  const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
  if (remaining > 0) return { locked: true, attempts: MAX_PIN_ATTEMPTS, lockSeconds: remaining };
  return { locked: false, attempts: 0, lockSeconds: 0 };
}

function PinCard({ lang, role }: { lang: Language; role: PinRole }) {
  const t = getTranslations(lang);
  const router = useRouter();
  const isDoctor = role === "doctor";
  const lockKey = isDoctor ? "swasthya_pin_lock" : "swasthya_asha_pin_lock";
  const pin = isDoctor ? DOCTOR_PIN : ASHA_PIN;

  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [lock, setLock] = useState<LockState>({
    locked: false,
    attempts: 0,
    lockSeconds: 0,
  });

  // Restore an in-progress lockout after a reload.
  useEffect(() => {
    const state = readLock(lockKey);
    if (state.locked) {
      setLock(state);
      setValue("");
    }
  }, [lockKey]);

  // Count down the lockout once it is active.
  useEffect(() => {
    if (!lock.locked) return;
    const id = window.setInterval(
      () =>
        setLock((previous) => ({
          ...previous,
          lockSeconds: Math.max(0, previous.lockSeconds - 1),
        })),
      1000
    );
    return () => window.clearInterval(id);
  }, [lock.locked]);

  // Release the lock when the countdown finishes.
  useEffect(() => {
    if (lock.lockSeconds === 0 && lock.attempts >= MAX_PIN_ATTEMPTS) {
      window.localStorage.removeItem(lockKey);
      setLock({ locked: false, attempts: 0, lockSeconds: 0 });
      setError(false);
      setValue("");
    }
  }, [lock.lockSeconds, lock.attempts, lockKey]);

  const attemptsLeft = Math.max(0, MAX_PIN_ATTEMPTS - lock.attempts);

  function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    if (lock.locked) return;

    if (value.trim() === pin) {
      setRole(role);
      router.push(roleHome(role));
      return;
    }

    setError(true);
    const next = lock.attempts + 1;
    if (next >= MAX_PIN_ATTEMPTS) {
      window.localStorage.setItem(
        lockKey,
        String(Date.now() + PIN_LOCK_SECONDS * 1000)
      );
      setLock({ locked: true, attempts: MAX_PIN_ATTEMPTS, lockSeconds: PIN_LOCK_SECONDS });
    } else {
      setLock((previous) => ({ ...previous, attempts: next }));
    }
  }

  const unlockLabel = isDoctor ? t.login.unlockPanel : t.login.unlockAsha;
  const lockTitle = isDoctor ? t.login.lockTitle : t.login.ashaLockTitle;
  const hint = isDoctor ? t.login.pinHint : t.login.ashaPinHint;

  return (
    <div className="glass-card lift-hover flex flex-col p-7 md:p-8">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          isDoctor
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isDoctor ? (
          <Stethoscope className="h-7 w-7" />
        ) : (
          <HeartHandshake className="h-7 w-7" />
        )}
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-slate-800">
        {isDoctor ? t.login.doctorTitle : t.login.ashaTitle}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
        {isDoctor ? t.login.doctorDesc : t.login.ashaDesc}
      </p>

      <form onSubmit={handleUnlock} className="mt-6">
        <label
          htmlFor={`${role}-pin`}
          className="text-xs font-bold uppercase tracking-wider text-slate-400"
        >
          {t.login.pinLabel}
        </label>
        <div className="relative mt-2">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id={`${role}-pin`}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={value}
            disabled={lock.locked}
            onChange={(event) =>
              setValue(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder={t.login.pinPlaceholder}
            className={`w-full rounded-xl border py-3 pl-10 pr-3.5 text-sm tracking-[0.3em] text-slate-800 placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              isDoctor
                ? "border-slate-200 bg-slate-50 focus:border-emerald-600 focus:ring-emerald-600/20"
                : "border-slate-200 bg-slate-50 focus:border-amber-600 focus:ring-amber-600/20"
            }`}
          />
        </div>

        {error && !lock.locked && (
          <p className="mt-2 text-xs font-bold text-red-600">{t.login.wrongPin}</p>
        )}
        {!lock.locked && lock.attempts > 0 && (
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {t.login.attemptsLeft.replace("{n}", String(attemptsLeft))}
          </p>
        )}
        {lock.locked && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Lock className="h-3.5 w-3.5" />
            {t.login.locked.replace("{n}", String(lock.lockSeconds))}
          </p>
        )}

        <button
          type="submit"
          disabled={lock.locked}
          className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-md transition ${
            lock.locked
              ? "cursor-not-allowed bg-slate-300 shadow-none"
              : isDoctor
                ? "bg-emerald-600 shadow-emerald-900/20 hover:bg-emerald-700"
                : "bg-amber-600 shadow-amber-900/20 hover:bg-amber-700"
          }`}
        >
          {lock.locked ? (
            <>
              <Lock className="h-4 w-4" />
              {lockTitle}
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              {unlockLabel}
            </>
          )}
        </button>
      </form>
      <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
        {hint}
      </p>
    </div>
  );
}

export default function LoginClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].login.title;
  const router = useRouter();

  function enterAsPatient() {
    setRole("patient");
    router.push("/triage");
  }

  return (
    <>
      <ClientLangToggle lang={lang} />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center overflow-hidden px-6 py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl"
        />

        <div className="relative w-full text-center">
          {/* Brand */}
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-600/30">
            <HeartPulse className="h-7 w-7 text-white" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-800">
            {t.appName}
          </h2>
          <p className="text-sm font-semibold text-blue-800">
            {t.appNameRoman} · Health Bridge
          </p>

          {/* Title */}
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 ring-1 ring-blue-200">
            <ShieldCheck className="h-4 w-4" />
            {t.login.badge}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-800 md:text-5xl">
            {t.login.title}
          </h1>
          <p className="mt-2 text-lg font-bold text-blue-800 md:text-2xl">
            {otherTitle}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
            {t.login.description}
          </p>
        </div>

        {/* Role cards */}
        <div className="relative mt-10 grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Patient card */}
          <div className="glass-card lift-hover flex flex-col p-7 md:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
              <UserRound className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-extrabold text-slate-800">
              {t.login.patientTitle}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              {t.login.patientDesc}
            </p>
            <button
              type="button"
              onClick={enterAsPatient}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-900"
            >
              {t.login.patientCta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <PinCard lang={lang} role="doctor" />
          <PinCard lang={lang} role="asha" />
        </div>
      </div>
    </>
  );
}