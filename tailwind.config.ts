import type { Config } from "tailwindcss";

/**
 * Swasthya Setu design tokens
 * ---------------------------
 * Theme-adaptive colours are mapped to CSS custom properties defined in
 * app/globals.css (:root for light, .dark for dark). Components therefore use
 * ONE set of utility classes (bg-panel, text-ink, border-line, bg-brand, ...)
 * and only the variable values change per theme — identical component logic
 * in both modes.
 *
 * Brand: sage green (muted clinical accent — not navy/neon-teal).
 * Neutrals: warm off-white (light) / warm charcoal (dark) — never pure navy.
 * Status: one accent per triage severity, adjusted for contrast per theme.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans", "system-ui", "sans-serif"],
      },
      colors: {
        /** Theme-adaptive surfaces */
        page: "var(--page)",
        panel: "var(--panel)",
        panel2: "var(--panel-2)",
        line: "var(--line)",
        /** Theme-adaptive text colours */
        ink: {
          DEFAULT: "var(--ink)", // primary text
          strong: "var(--ink-strong)", // headings
          mute: "var(--ink-mute)", // secondary text
          faint: "var(--ink-faint)", // placeholders / disabled
        },
        /** Theme-adaptive brand (sage green) */
        brand: {
          DEFAULT: "var(--brand)", // interactive accent (links, focus, active)
          strong: "var(--brand-strong)", // filled buttons
          soft: "var(--brand-soft)", // hover fill / selected row
          tint: "var(--brand-tint)", // subtle tinted background
        },
        /** Triage severity accents (theme-adaptive) */
        status: {
          safe: "var(--status-safe)",
          "safe-tint": "var(--status-safe-tint)",
          attention: "var(--status-attention)",
          "attention-tint": "var(--status-attention-tint)",
          emergency: "var(--status-emergency)",
          "emergency-tint": "var(--status-emergency-tint)",
        },
        /** Static sage scale (theme-independent uses, e.g. illustrations) */
        sage: {
          50: "#EFF5F0",
          100: "#DCE9DF",
          200: "#B9D3BF",
          300: "#A3C9AD",
          400: "#7FAF8C",
          500: "#69987A",
          600: "#4A7C59",
          700: "#3D6649",
          800: "#2F5039",
          900: "#24402C",
        },
      },
      borderRadius: {
        /** Clinical radius scale — modest, not bubbly */
        card: "12px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(38, 48, 43, 0.05)",
        "panel-lift": "0 4px 14px rgba(38, 48, 43, 0.09)",
      },
      minHeight: {
        /** 48px minimum tap target for rural users */
        touch: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
