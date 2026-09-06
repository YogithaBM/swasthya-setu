import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";

import AppShell from "@/components/AppShell";
import { getLang } from "@/lib/lang";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

const notoSans = Noto_Sans({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "Swasthya Setu · स्वास्थ्य सेतु — Health Bridge",
  description:
    "Connecting Rural India to Quality Healthcare. A rural healthcare platform for Maharashtra.",
};

/** Applies the stored theme before first paint (no flash of wrong theme). */
const themeBootScript = `
(function () {
  try {
    var theme = localStorage.getItem("swasthya_theme");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();

  return (
    <html lang={lang === "hi" ? "hi" : "en"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${inter.variable} ${notoSans.variable} font-sans min-h-screen text-slate-900 antialiased dark:text-slate-100`}
      >
        {/* AppShell handles login redirects, role-based route access, and the top nav. */}
        <AppShell lang={lang}>{children}</AppShell>
      </body>
    </html>
  );
}
