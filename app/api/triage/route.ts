import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

import type { FacilityLevel } from "@/lib/data";
import type { Language } from "@/lib/translations";
import {
  FACILITY_EN_LABELS,
  localTriage,
  SEVERITY_LABELS,
  SEVERITY_TO_LEVEL,
  type TriageResultData,
  type TriageSeverity,
} from "@/lib/triage";

const API_KEY = process.env.GEMINI_API_KEY ?? "";
// Fast model first — gemini-1.5-flash answers in ~1-2s. The configured
// default (gemini-2.0-flash) is kept as a retry candidate because Google
// has retired older flash models on some accounts (404 "no longer
// available"); trying in order keeps latency low while staying resilient.
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-3.6-flash",
];
/** Hard ceiling on the whole Gemini attempt (spec: 30s). */
const GEMINI_TIMEOUT_MS = 30_000;
/** When to give up waiting and answer with the local keyword fallback. */
const FALLBACK_AFTER_MS = 10_000;

/** True when Google reports the model itself is gone (404 / NOT_FOUND). */
function isModelUnavailable(error: unknown): boolean {
  const err = error as { status?: number; message?: string };
  if (typeof err?.status === "number" && err.status === 404) return true;
  const message = err?.message ?? String(error);
  return /no longer available|not found|does not (exist|support)|models\//i.test(message);
}

/**
 * Runs one generateContent call under a hard AbortController timeout so a
 * hung request can never hold the route open (30s ceiling per spec).
 */
async function generateContentWithTimeout(
  genAI: GoogleGenAI,
  model: string,
  contents: string,
  timeoutMs: number
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // This SDK version takes a single params object; the abort signal lives
    // on GenerateContentConfig.
    const response = await genAI.models.generateContent({
      model,
      contents,
      config: { abortSignal: controller.signal },
    });
    const text =
      typeof response.text === "string" && response.text.trim()
        ? response.text
        : response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text.trim()) throw new Error("Empty Gemini response");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

/** Tries each model candidate in order; returns the first usable text. */
async function generateText(genAI: GoogleGenAI, contents: string): Promise<string> {
  let lastError: unknown;
  for (const model of MODEL_CANDIDATES) {
    try {
      return await generateContentWithTimeout(genAI, model, contents, GEMINI_TIMEOUT_MS);
    } catch (error) {
      lastError = error;
      // A timeout/abort is not a model-availability problem — stop trying
      // other models and surface it so the caller can fall back quickly.
      if (controllerAborted(error)) throw error;
      if (!isModelUnavailable(error)) throw error;
      console.warn(`[triage] model "${model}" unavailable; trying next candidate`);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All Gemini models failed");
}

function controllerAborted(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /abort/i.test(message) || (error as { name?: string })?.name === "AbortError";
}

/**
 * Compact prompt (~70 tokens) — short prompts cut both latency and cost.
 * Returns strict JSON only.
 */
function buildPrompt(symptoms: string, lang: Language): string {
  const languageName = lang === "hi" ? "Hindi" : "English";
  return `Rural India triage. Symptoms: "${symptoms.slice(0, 300)}". Reply ONLY with JSON: {"severity":"green|yellow|red","recommended_facility":"Sub-Centre|PHC|Rural Hospital|District Hospital","reason":"<one short sentence in ${languageName}>","advice":"<one short sentence in ${languageName}>"}. red=emergency(chest pain, bleeding, unconscious, breathing trouble), yellow=needs care(fever, vomiting, diarrhea, infection), green=mild.`;
}

const SEVERITY_ALIASES: Record<string, TriageSeverity> = {
  green: "green",
  yellow: "yellow",
  red: "red",
  safe: "green",
  attention: "yellow",
  emergency: "red",
};

const FACILITY_ALIASES: Record<string, FacilityLevel> = {
  "sub-centre": "sub_centre",
  "sub centre": "sub_centre",
  sub_centre: "sub_centre",
  subcentre: "sub_centre",
  "sub center": "sub_centre",
  subcenter: "sub_centre",
  phc: "phc",
  "primary health centre": "phc",
  "primary health center": "phc",
  "rural hospital": "rural_hospital",
  "district hospital": "district_hospital",
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeSeverity(raw: string | undefined): TriageSeverity {
  if (!raw) return "yellow";
  return SEVERITY_ALIASES[raw.toLowerCase()] ?? "yellow";
}

function normalizeFacility(raw: string | undefined, severity: TriageSeverity): FacilityLevel {
  if (!raw) return SEVERITY_TO_LEVEL[severity];
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  return FACILITY_ALIASES[key] ?? SEVERITY_TO_LEVEL[severity];
}

/** Strips markdown code fences and extracts the first JSON object. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON found in Gemini response");
  return JSON.parse(raw.slice(start, end + 1));
}

function normalizeResult(parsed: unknown, lang: Language): TriageResultData {
  const obj = (typeof parsed === "object" && parsed !== null ? parsed : {}) as Record<
    string,
    unknown
  >;
  const severity = normalizeSeverity(
    asString(obj.severity) ?? asString(obj.severity_label)
  );
  const level = normalizeFacility(asString(obj.recommended_facility), severity);
  return {
    severity,
    severity_label: SEVERITY_LABELS[severity][lang],
    recommended_facility: FACILITY_EN_LABELS[level],
    facility_level: level,
    reason:
      asString(obj.reason) ??
      (lang === "hi" ? "डॉक्टर से सलाह लें।" : "Please consult a doctor."),
    advice:
      asString(obj.advice) ??
      (lang === "hi"
        ? "नज़दीकी स्वास्थ्य केंद्र पर जाकर डॉक्टर से मिलें।"
        : "Visit the nearest health centre and see a doctor."),
  };
}

/** Single Gemini attempt with the compact prompt. */
async function callGemini(symptoms: string, lang: Language): Promise<TriageResultData> {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const text = await generateText(genAI, buildPrompt(symptoms, lang));
  return normalizeResult(extractJson(text), lang);
}

/**
 * Gemini with a local-fallback race: if the model hasn't answered within
 * FALLBACK_AFTER_MS (10s), the keyword-based localTriage result is returned
 * immediately instead of making the user wait. The Gemini promise keeps
 * running in the background and is simply discarded — the fallback answer
 * is what ships.
 */
type GeminiOutcome = { result: TriageResultData; source: "gemini" | "fallback" };

async function triageWithFallback(
  symptoms: string,
  lang: Language
): Promise<{ result: TriageResultData; source: "gemini" | "fallback" }> {
  const geminiPromise = callGemini(symptoms, lang).then(
    (result): GeminiOutcome => ({ result, source: "gemini" })
  );
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  const fallbackPromise = new Promise<GeminiOutcome>((resolve) => {
    fallbackTimer = setTimeout(() => {
      console.warn(
        `[triage] no Gemini answer within ${FALLBACK_AFTER_MS / 1000}s — returning local fallback`
      );
      resolve({ result: localTriage(symptoms, lang), source: "fallback" });
    }, FALLBACK_AFTER_MS);
  });
  try {
    return await Promise.race([geminiPromise, fallbackPromise]);
  } finally {
    // Gemini won: stop the fallback timer so it doesn't linger. If the
    // fallback already fired, the gemini promise result is simply dropped.
    if (fallbackTimer) clearTimeout(fallbackTimer);
    geminiPromise.catch(() => {}); // avoid unhandled rejection after the race
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const symptoms = asString(record.symptoms);
  if (!symptoms) {
    return NextResponse.json({ error: "symptoms is required" }, { status: 400 });
  }
  if (symptoms.length > 3000) {
    return NextResponse.json(
      { error: "symptoms is too long (max 3000 chars)" },
      { status: 400 }
    );
  }

  const lang: Language = record.lang === "en" ? "en" : "hi";

  // No key configured → use the offline fallback so the page always works.
  if (!API_KEY) {
    return NextResponse.json({ result: localTriage(symptoms, lang), source: "fallback" });
  }

  try {
    const { result, source } = await triageWithFallback(symptoms, lang);
    return NextResponse.json({ result, source });
  } catch (error) {
    console.error("[triage] Gemini failed, using fallback:", error);
    return NextResponse.json({ result: localTriage(symptoms, lang), source: "fallback" });
  }
}
