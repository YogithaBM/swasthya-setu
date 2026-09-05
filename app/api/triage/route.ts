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
// gemini-2.0-flash is the configured default (override via GEMINI_MODEL).
// Google retired the older flash models on this account, returning 404
// "no longer available", so we retry once with a model the API actually
// serves rather than silently degrading to the offline fallback.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-3.6-flash";

/** True when Google reports the model itself is gone (404 / NOT_FOUND). */
function isModelUnavailable(error: unknown): boolean {
  const err = error as { status?: number; message?: string };
  if (typeof err?.status === "number" && err.status === 404) return true;
  const message = err?.message ?? String(error);
  return /no longer available|not found|does not (exist|support)|models\//i.test(message);
}

async function generateContent(
  genAI: GoogleGenAI,
  model: string,
  contents: string
) {
  try {
    return await genAI.models.generateContent({ model, contents });
  } catch (error) {
    if (model !== FALLBACK_MODEL && isModelUnavailable(error)) {
      console.warn(
        `[triage] model \"${model}\" unavailable (${(error as Error).message}); retrying with \"${FALLBACK_MODEL}\"`
      );
      return await genAI.models.generateContent({ model: FALLBACK_MODEL, contents });
    }
    throw error;
  }
}

function buildPrompt(symptoms: string, lang: Language): string {
  const languageName = lang === "hi" ? "Hindi" : "English";
  return `You are a rural healthcare triage assistant for Maharashtra, India. Analyze these symptoms and return JSON with: severity (green/yellow/red), severity_label (Safe/Attention/Emergency), recommended_facility (Sub-Centre/PHC/Rural Hospital/District Hospital), reason (in ${languageName}, simple language), advice (in ${languageName}). Symptoms: ${symptoms}. Return ONLY valid JSON.`;
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
  "sub_centre": "sub_centre",
  "subcentre": "sub_centre",
  "sub center": "sub_centre",
  "subcenter": "sub_centre",
  "phc": "phc",
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

async function callGemini(symptoms: string, lang: Language): Promise<TriageResultData> {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await generateContent(genAI, MODEL, buildPrompt(symptoms, lang));

  const text =
    typeof response.text === "string" && response.text.trim()
      ? response.text
      : response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("Empty Gemini response");

  return normalizeResult(extractJson(text), lang);
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
    return NextResponse.json({ error: "symptoms is too long (max 3000 chars)" }, { status: 400 });
  }

  const lang: Language = record.lang === "en" ? "en" : "hi";

  // No key configured → use the offline fallback so the page always works.
  if (!API_KEY) {
    return NextResponse.json({ result: localTriage(symptoms, lang), source: "fallback" });
  }

  try {
    const result = await callGemini(symptoms, lang);
    return NextResponse.json({ result, source: "gemini" });
  } catch (error) {
    console.error("[triage] Gemini failed, using fallback:", error);
    return NextResponse.json({ result: localTriage(symptoms, lang), source: "fallback" });
  }
}