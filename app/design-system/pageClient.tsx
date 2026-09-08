"use client";

import { useTheme } from "@/lib/theme";
import { getTranslations, type Language } from "@/lib/translations";

/**
 * Design-system showcase — a living spec sheet for the Swasthya Setu visual
 * language. Every section demonstrates a token or primitive in the CURRENT
 * theme; flip the theme toggle to compare light and dark with one click.
 * This page is for design review; product pages adopt these primitives next.
 */

const SAGE_SCALE = [
  { name: "50", hex: "#EFF5F0" },
  { name: "100", hex: "#DCE9DF" },
  { name: "200", hex: "#B9D3BF" },
  { name: "300", hex: "#A3C9AD" },
  { name: "400", hex: "#7FAF8C" },
  { name: "500", hex: "#69987A" },
  { name: "600", hex: "#4A7C59" },
  { name: "700", hex: "#3D6649" },
  { name: "800", hex: "#2F5039" },
  { name: "900", hex: "#24402C" },
];

function Swatch({ label, varName }: { label: string; varName: string }) {
  return (
    <div className="ds-panel p-3">
      <div
        className="h-10 w-full rounded-md border border-line"
        style={{ background: `var(${varName})` }}
      />
      <p className="mt-2 text-sm font-bold text-ink">{label}</p>
      <p className="font-mono text-xs text-ink-faint">{varName}</p>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-xl font-extrabold tracking-tight text-ink-strong">{title}</h2>
      {note && <p className="mt-1 max-w-2xl text-sm text-ink-mute">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function DesignSystemClient({ lang }: { lang: Language }) {
  const t = getTranslations(lang);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      {/* Header — plain, informative, no gradient hero. */}
      <header className="ds-panel flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-strong">
            Swasthya Setu — Design System
          </h1>
          <p className="mt-1 text-sm text-ink-mute">
            {t.appNameRoman} · visual language spec · currently viewing{" "}
            <strong className="text-ink">{theme === "dark" ? "Dark" : "Light"}</strong> mode
          </p>
        </div>
        <button type="button" onClick={toggleTheme} className="ds-btn ds-btn-secondary">
          {theme === "dark" ? "☀ Light" : "☾ Dark"}
        </button>
      </header>

      {/* 1 — Colour tokens */}
      <Section
        title="1 · Colour tokens"
        note="Theme-adaptive variables: the same utility classes (bg-panel, text-ink, bg-brand…) resolve to different values per theme. Sage green is the single brand accent in both modes."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Swatch label="Page background" varName="--page" />
          <Swatch label="Panel (card)" varName="--panel" />
          <Swatch label="Panel nested" varName="--panel-2" />
          <Swatch label="Hairline border" varName="--line" />
          <Swatch label="Brand (sage)" varName="--brand" />
          <Swatch label="Brand filled" varName="--brand-strong" />
          <Swatch label="Brand hover fill" varName="--brand-soft" />
          <Swatch label="Brand tint" varName="--brand-tint" />
          <Swatch label="Status: safe" varName="--status-safe" />
          <Swatch label="Status: attention" varName="--status-attention" />
          <Swatch label="Status: emergency" varName="--status-emergency" />
          <Swatch label="Emergency tint" varName="--status-emergency-tint" />
        </div>
        <div className="ds-panel mt-4 p-4">
          <p className="ds-label">Static sage scale (theme-independent)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAGE_SCALE.map((s) => (
              <div key={s.name} className="text-center">
                <div
                  className="h-10 w-12 rounded-md border border-line"
                  style={{ background: s.hex }}
                />
                <p className="mt-1 font-mono text-[10px] text-ink-faint">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 2 — Typography */}
      <Section
        title="2 · Typography"
        note="Inter for Latin, Noto Sans for Devanagari — both load for every user so Hindi and English carry equal weight. Hindi is never a smaller subtitle."
      >
        <div className="ds-panel space-y-3 p-6">
          <p className="text-3xl font-extrabold tracking-tight text-ink-strong">
            स्वास्थ्य सेतु · Swasthya Setu
          </p>
          <p className="text-xl font-bold text-ink">Heading 2 — शीर्षक दो / Heading two</p>
          <p className="text-base font-semibold text-ink">
            Body text — यह मरीज़ की जानकारी है। / This is patient information.
          </p>
          <p className="text-sm text-ink-mute">
            Secondary text — नज़दीकी स्वास्थ्य केंद्र। / Nearest health centre.
          </p>
          <p className="text-sm text-ink-faint">
            Placeholder — अपनी तकलीफ बताएं… / Describe your symptoms…
          </p>
        </div>
      </Section>

      {/* 3 — Triage severity */}
      <Section
        title="3 · Triage severity — shape + colour + label"
        note="Colour alone never carries meaning: circle = safe, triangle = attention, octagon (stop-sign) = emergency. Emergency is the loudest in both themes."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="ds-panel flex items-center justify-between gap-3 p-4">
            <span className="ds-status ds-status-safe">
              <span className="ds-shape ds-shape-circle" />
              सुरक्षित / Safe
            </span>
          </div>
          <div className="ds-panel flex items-center justify-between gap-3 p-4">
            <span className="ds-status ds-status-attention">
              <span className="ds-shape ds-shape-triangle" />
              ध्यान दें / Attention
            </span>
          </div>
          <div className="ds-panel flex items-center justify-between gap-3 p-4 ring-2 ring-status-emergency">
            <span className="ds-status ds-status-emergency">
              <span className="ds-shape ds-shape-octagon" />
              आपातकाल / Emergency
            </span>
          </div>
        </div>
      </Section>

      {/* 4 — Buttons */}
      <Section
        title="4 · Buttons"
        note="Solid sage primary, outlined secondary, quiet ghost, deep-red danger. 48px tall for gloved or hurried hands. No gradients, no arrow icons."
      >
        <div className="ds-panel flex flex-wrap items-center gap-3 p-6">
          <button type="button" className="ds-btn ds-btn-primary">बुक करें / Book</button>
          <button type="button" className="ds-btn ds-btn-secondary">विवरण / Details</button>
          <button type="button" className="ds-btn ds-btn-ghost">रद्द करें / Cancel</button>
          <button type="button" className="ds-btn ds-btn-danger">आपातकाल / Emergency</button>
          <button type="button" className="ds-btn ds-btn-primary" disabled style={{ opacity: 0.45 }}>
            अक्षम / Disabled
          </button>
        </div>
      </Section>

      {/* 5 — Forms */}
      <Section
        title="5 · Form fields"
        note="48px inputs, 1.5px visible borders, sage focus ring, muted placeholder. Labels sit above fields in the user's language."
      >
        <div className="ds-panel grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label className="ds-label" htmlFor="ds-name">मरीज़ का नाम / Patient name</label>
            <input id="ds-name" className="ds-input" placeholder="पूरा नाम / Full name" />
          </div>
          <div>
            <label className="ds-label" htmlFor="ds-phone">मोबाइल / Mobile</label>
            <input id="ds-phone" className="ds-input" inputMode="numeric" placeholder="10 अंक / 10 digits" />
          </div>
          <div>
            <label className="ds-label" htmlFor="ds-fac">सुविधा / Facility</label>
            <select id="ds-fac" className="ds-input">
              <option>शेलगाँव उपकेंद्र / Shelgaon Sub-Centre</option>
              <option>अंजनगांव पीएचसी / Anjangaon PHC</option>
            </select>
          </div>
          <div>
            <label className="ds-label" htmlFor="ds-notes">नोट्स / Notes</label>
            <input id="ds-notes" className="ds-input" placeholder="डॉक्टर की सलाह / Doctor's advice" />
          </div>
        </div>
      </Section>

      {/* 6 — Panels & tables */}
      <Section
        title="6 · Panels, lists & tables"
        note="Solid panels with hairline borders replace glass. Rows separate by hairline, not zebra stripes. Badges are quiet labels, not decorations."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="ds-panel p-5">
            <p className="font-extrabold text-ink-strong">शेलगाँव उपकेंद्र / Shelgaon Sub-Centre</p>
            <p className="mt-0.5 text-sm text-ink-mute">उपकेंद्र · अमरावती / Sub-Centre · Amravati</p>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-sm">
              <span className="font-bold text-ink">3/6</span>
              <span className="text-ink-mute">बिस्तर उपलब्ध / beds available</span>
            </div>
          </div>
          <div className="ds-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-panel-2 text-left">
                  <th className="px-4 py-2.5 font-bold text-ink-mute">मरीज़ / Patient</th>
                  <th className="px-4 py-2.5 font-bold text-ink-mute">समय / Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="px-4 py-3 font-semibold text-ink">निश्चिता / Nischitha</td>
                  <td className="px-4 py-3 text-ink-mute">10:30 AM</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink">रमेश / Ramesh</td>
                  <td className="px-4 py-3 text-ink-mute">11:00 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* 7 — Spacing & tap targets */}
      <Section
        title="7 · Spacing & tap targets"
        note="Minimum 48px touch height everywhere; generous 12/16/24px rhythm. Everything interactive below is at least 48px tall."
      >
        <div className="ds-panel flex flex-wrap items-center gap-4 p-6">
          <button type="button" className="ds-btn ds-btn-secondary min-h-touch">48px button</button>
          <input className="ds-input max-w-[220px] min-h-touch" placeholder="48px input" />
          <span className="ds-status ds-status-safe min-h-touch">48px status chip</span>
        </div>
      </Section>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        Swasthya Setu design system · tokens live in tailwind.config.ts + app/globals.css ·
        this page is public at /design-system
      </footer>
    </div>
  );
}
