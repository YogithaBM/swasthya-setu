"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeartHandshake,
  HeartPulse,
  KeyRound,
  Lock,
  ShieldCheck,
  Stethoscope,
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
    <div className="ds-panel flex flex-col p-7 md:p-8">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-lg ${
          isDoctor
            ? "bg-brand-tint text-brand"
            : "bg-status-attention-tint text-status-attention"
        }`}
      >
        {isDoctor ? (
          <Stethoscope className="h-7 w-7" />
        ) : (
          <HeartHandshake className="h-7 w-7" />
        )}
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-ink-strong">
        {isDoctor ? t.login.doctorTitle : t.login.ashaTitle}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-mute">
        {isDoctor ? t.login.doctorDesc : t.login.ashaDesc}
      </p>

      <form onSubmit={handleUnlock} className="mt-6">
        <label
          htmlFor={`${role}-pin`}
          className="ds-label"
        >
          {t.login.pinLabel}
        </label>
        <div className="relative mt-2">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
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
            className="ds-input pl-10 tracking-[0.3em] placeholder:tracking-normal"
          />
        </div>

        {error && !lock.locked && (
          <p className="mt-2 text-xs font-bold text-status-emergency">{t.login.wrongPin}</p>
        )}
        {!lock.locked && lock.attempts > 0 && (
          <p className="mt-1 text-[11px] font-semibold text-ink-faint">
            {t.login.attemptsLeft.replace("{n}", String(attemptsLeft))}
          </p>
        )}
        {lock.locked && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-status-attention">
            <Lock className="h-3.5 w-3.5" />
            {t.login.locked.replace("{n}", String(lock.lockSeconds))}
          </p>
        )}

        <button
          type="submit"
          disabled={lock.locked}
          className="ds-btn ds-btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-45"
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
      <p className="mt-3 text-center text-[11px] font-semibold text-ink-faint">
        {hint}
      </p>
    </div>
  );
}

export default function LoginClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const otherTitle = translations[lang === "hi" ? "en" : "hi"].login.title;

  return (
    <>
      <ClientLangToggle lang={lang} />
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-14 md:px-6">
        <div className="relative w-full text-center">
          {/* Brand */}
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-strong text-brand-strong-ink">
            <HeartPulse className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-ink-strong">
            {t.appName}
          </h2>
          <p className="text-sm font-semibold text-brand">
            {t.appNameRoman} · Health Bridge
          </p>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink-strong md:text-5xl">
            {t.login.title}
          </h1>
          <p className="mt-2 text-lg font-bold text-brand md:text-2xl">
            {otherTitle}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-mute md:text-base">
            {t.login.description}
          </p>
        </div>

        {/* Staff PIN cards only — patients enter via the homepage CTA. */}
        <div className="relative mt-10 grid w-full gap-8 md:grid-cols-2">
          <PinCard lang={lang} role="doctor" />
          <PinCard lang={lang} role="asha" />
        </div>
      </div>
    </>
  );
}