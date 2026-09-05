import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";

import AppShell from "@/components/AppShell";
import { getLang } from "@/lib/lang";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swasthya Setu · स्वास्थ्य सेतु — Health Bridge",
  description:
    "Connecting Rural India to Quality Healthcare. A rural healthcare platform for Maharashtra.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();

  return (
    <html lang={lang === "hi" ? "hi" : "en"}>
      <body
        className={`${notoSans.className} min-h-screen bg-slate-100 text-slate-900 antialiased`}
      >
        {/* AppShell handles login redirects, role-based route access, and the top nav. */}
        <AppShell lang={lang}>{children}</AppShell>
      </body>
    </html>
  );
}