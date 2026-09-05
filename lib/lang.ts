import { cookies } from "next/headers";

import type { Language } from "@/lib/translations";

/** Reads the language preference set by the sidebar toggle (server components only). */
export function getLang(): Language {
  const value = cookies().get("lang")?.value;
  return value === "hi" ? "hi" : "en";
}