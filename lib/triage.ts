import type { FacilityLevel } from "@/lib/data";
import type { Language } from "@/lib/translations";

export type TriageSeverity = "green" | "yellow" | "red";

export interface TriageResultData {
  severity: TriageSeverity;
  severity_label: string;
  recommended_facility: string;
  facility_level: FacilityLevel;
  reason: string;
  advice: string;
}

export interface TriageResponse {
  result: TriageResultData;
  source: "gemini" | "fallback";
}

export const SEVERITY_LABELS: Record<TriageSeverity, { en: string; hi: string }> = {
  green: { en: "Safe", hi: "सुरक्षित" },
  yellow: { en: "Attention", hi: "ध्यान दें" },
  red: { en: "Emergency", hi: "आपातकाल" },
};

export const SEVERITY_EMOJI: Record<TriageSeverity, string> = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
};

export const FACILITY_EN_LABELS: Record<FacilityLevel, string> = {
  sub_centre: "Sub-Centre",
  phc: "PHC",
  rural_hospital: "Rural Hospital",
  district_hospital: "District Hospital",
};

/** Default facility level per severity when the model output is unclear. */
export const SEVERITY_TO_LEVEL: Record<TriageSeverity, FacilityLevel> = {
  green: "sub_centre",
  yellow: "phc",
  red: "district_hospital",
};

/**
 * Offline keyword-based triage used when no Gemini API key is configured or
 * the API call fails. Keeps the demo fully functional and safe.
 */
const EMERGENCY_KEYWORDS = [
  "chest pain",
  "छाती",
  "breath",
  "सांस लेने",
  "साँस लेने",
  "breathless",
  "unconscious",
  "बेहोश",
  "fainted",
  "bleeding",
  "खून बह",
  "blood loss",
  "snake",
  "सांप",
  "poison",
  "जहर",
  "heart attack",
  "दिल का दौरा",
  "stroke",
  "लकवा",
  "seizure",
  "दौरा",
  "convulsion",
  "accident",
  "दुर्घटना",
  "burn",
  "जल गय",
  "choking",
  "दम घुट",
  "electric",
  "बिजली का झटका",
  // Breathing / chest red-flag phrasings (e.g. "सांस फूल रही है")
  "shortness of breath",
  "breathless",
  "breathlessness",
  "breathing problem",
  "difficulty breathing",
  "सांस फूल",
  "साँस फूल",
  "सांस नहीं आ",
  "साँस नहीं आ",
  "सीने में दर्द",
  "सीने में जकड़न",
  "सीने पर दबाव",
  "छाती में दर्द",
  "छाती में जकड़न",
];

const ATTENTION_KEYWORDS = [
  "vomiting",
  "उल्टी",
  "diarrhea",
  "दस्त",
  "stomach pain",
  "पेट दर्द",
  "पेट में दर्द",
  "abdominal",
  "high fever",
  "तेज बुखार",
  "तेज़ बुखार",
  "rash",
  "चकत्ते",
  "dizziness",
  "चक्कर",
  "weakness",
  "कमजोरी",
  "blood pressure",
  "बीपी",
  "fracture",
  "हड्डी",
  "sprain",
  "मोच",
  "swelling",
  "सूजन",
  "dehydration",
  "पानी की कमी",
  "sugar",
  "शुगर",
  "diabetes",
  "pregnancy",
  "गर्भवती",
  "infection",
  "infection",
  "संक्रमण",
  "खून",
  "टीबी",
  "tb",
];

/**
 * Symptom families — used to tell single mild symptoms apart from
 * multi-symptom or more serious presentations.
 */
const SYMPTOM_FAMILIES: Record<string, string[]> = {
  fever: ["बुखार", "बुख़ार", "fever", "ताप"],
  headache: ["सिरदर्द", "सिर दर्द", "सिर में दर्द", "headache"],
  cough: ["खांसी", "खाँसी", "cough"],
  cold: ["जुकाम", "ज़ुकाम", "cold", "नाक बह", "runny nose"],
  throat: ["गले में खराश", "गले में दर्द", "sore throat"],
  bodyache: ["बदन दर्द", "शरीर में दर्द", "body pain", "body ache", "muscle pain"],
  tiredness: ["थकान", "कमज़ोरी", "कमजोरी", "weakness", "tired", "fatigue"],
  appetite: ["भूख नहीं", "भूख कम", "loss of appetite", "appetite"],
};

/** Words that mark a symptom as clearly mild ("हल्का सिरदर्द"). */
const MILD_QUALIFIER = /हल्क|थोड़ा|थोड़ी|ज़रा|जरा|मामूली|mild|slight|minor/i;

/** Phrasings meaning the symptom only started today, not a real duration. */
const STARTED_TODAY = /आज से|आज ही|today|just started/i;

/** Any mention of a symptom lasting roughly a day or more. */
const DURATION_REGEX =
  /दिन|दिनों|हफ़्ते|हफ्ते|सप्ताह|महीने|\bdays?\b|\bweeks?\b|\bmonths?\b/i;

function severityFor(symptoms: string): TriageSeverity {
  const text = symptoms.toLowerCase().trim();
  if (!text) return "yellow";

  // 1) Red flags always win — never downgrade chest pain, breathing trouble,
  //    bleeding or unconsciousness because of a mild keyword elsewhere.
  if (EMERGENCY_KEYWORDS.some((keyword) => text.includes(keyword))) return "red";

  // 2) Which symptom families does the input mention?
  const families = Object.entries(SYMPTOM_FAMILIES)
    .filter(([, words]) => words.some((word) => text.includes(word)))
    .map(([name]) => name);
  const hasFever = families.includes("fever");
  const hasDuration = DURATION_REGEX.test(text);
  const hasAttentionSymptom = ATTENTION_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );

  // 3) Attention (yellow): fever on its own ("बुखार"), any symptom lasting
  //    1+ days ("बुखार 2 दिन से", "cough for 3 days"), several symptoms at
  //    once, or a known attention-worthy symptom (उल्टी, दस्त, ...).
  if (hasFever || hasDuration || hasAttentionSymptom || families.length >= 2) {
    return "yellow";
  }

  // 4) Safe (green): only a genuinely mild, single symptom — "जुकाम" (cold),
  //    "हल्का सिरदर्द" (mild headache), "खांसी आज से" (cough just started).
  if (families.length === 1) {
    const [single] = families;
    if (single === "cold") return "green";
    if (MILD_QUALIFIER.test(text)) return "green";
    if (single === "cough" && STARTED_TODAY.test(text)) return "green";
  }

  // Unknown or ambiguous → attention. Never underestimate in triage.
  return "yellow";
}

const FALLBACK_MESSAGES: Record<
  Language,
  Record<TriageSeverity, { reason: string; advice: string }>
> = {
  hi: {
    green: {
      reason: "आपके लक्षण हल्के हैं और घर पर देखभाल से ठीक हो सकते हैं।",
      advice:
        "आराम करें, गर्म पानी पिएँ और हल्का भोजन लें। डॉक्टर की सलाह पर पैरासिटामोल ले सकते हैं। लक्षण बिगड़ें तो नज़दीकी स्वास्थ्य केंद्र पर जाएँ।",
    },
    yellow: {
      reason: "आपके लक्षण मध्यम गंभीरता के हैं — इन्हें अनदेखा नहीं करना चाहिए।",
      advice: "आज ही नज़दीकी प्राथमिक स्वास्थ्य केंद्र (पीएचसी) में डॉक्टर से मिलें। आराम करें और पानी पीते रहें।",
    },
    red: {
      reason: "आपके लक्षण गंभीर हैं और तुरंत चिकित्सा सहायता की आवश्यकता है।",
      advice: "तुरंत नज़दीकी जिला अस्पताल जाएँ या 108 एम्बुलेंस बुलाएँ। अकेले यात्रा न करें।",
    },
  },
  en: {
    green: {
      reason: "Your symptoms are mild and can be managed with home care.",
      advice:
        "Rest, drink warm water and eat light meals. You may take paracetamol on a doctor's advice. Visit the nearest health facility if symptoms worsen.",
    },
    yellow: {
      reason: "Your symptoms are moderately serious — they should not be ignored.",
      advice:
        "See a doctor at the nearest Primary Health Centre (PHC) today. Rest and keep drinking water.",
    },
    red: {
      reason: "Your symptoms are serious and need immediate medical attention.",
      advice:
        "Go to the nearest District Hospital immediately or call 108 ambulance. Do not travel alone.",
    },
  },
};

export function localTriage(symptoms: string, lang: Language = "hi"): TriageResultData {
  const severity = severityFor(symptoms);
  const level = SEVERITY_TO_LEVEL[severity];
  const message = FALLBACK_MESSAGES[lang][severity];
  return {
    severity,
    severity_label: SEVERITY_LABELS[severity][lang],
    recommended_facility: FACILITY_EN_LABELS[level],
    facility_level: level,
    reason: message.reason,
    advice: message.advice,
  };
}