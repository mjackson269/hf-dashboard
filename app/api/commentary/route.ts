import { NextResponse } from "next/server";
import { generateDeterministicAlerts } from "@/app/lib/alertsEngine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---------------------------------------------------------
// Timeout wrapper
// ---------------------------------------------------------
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("AI timeout")), ms)
    ),
  ]);
}

// ---------------------------------------------------------
// Extract JSON safely from AI output
// ---------------------------------------------------------
function extractJson(text: string): string {
  text = text.replace(/```json/gi, "").replace(/```/g, "");

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1) {
    throw new Error("No JSON object found in AI response");
  }

  return text.substring(first, last + 1);
}

// ---------------------------------------------------------
// Provider configs
// ---------------------------------------------------------
const PROVIDERS = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    key: process.env.GROQ_API_KEY,
  },
  deepseek: {
    url: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    key: process.env.DEEPSEEK_API_KEY,
  },
};

// ---------------------------------------------------------
// Try a provider (FIXED TYPES)
// ---------------------------------------------------------
type ProviderName = keyof typeof PROVIDERS;

async function tryProvider(
  providerName: ProviderName,
  systemPrompt: string,
  payload: any
) {
  const cfg = PROVIDERS[providerName];

  if (!cfg.key) {
    throw new Error(`Missing API key for provider: ${providerName}`);
  }

  const res = await withTimeout(
    fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(payload) },
        ],
        temperature: 0.4,
      }),
    }),
    8000
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upstream ${providerName} error: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
// ---------------------------------------------------------
// MAIN ROUTE
// ---------------------------------------------------------
export async function GET() {
  const origin = "https://hf-dashboard-weld.vercel.app";

  let current: any = null;

  // ---------------------------------------------------------
  // Fetch deterministic current data
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${origin}/api/current`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    current = await res.json();
  } catch (err) {
    console.error("Failed to fetch /api/current:", err);
    return NextResponse.json({
      quickTake: "Propagation commentary unavailable.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      alerts: [],
      forecast24h: [],
      generatedAt: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // Deterministic Alerts
  // ---------------------------------------------------------
  const deterministicAlerts = generateDeterministicAlerts(current);

  // ---------------------------------------------------------
  // AI payload (NO AI DX!)
  // ---------------------------------------------------------
  const payload = {
    sfi: current.sfiEstimated,
    kp: current.kp,
    muf: current.muf,
    bands: current.bands,
    score: current.score,
    forecast24h: current.forecast24h, // deterministic
  };

  // ---------------------------------------------------------
  // System Prompt
  // ---------------------------------------------------------
  const systemPrompt = `
You are an HF radio propagation analyst generating a concise, operator-grade briefing for UK amateur radio conditions.
Your tone is factual, confident, and technically aware.

Return ONLY a JSON object with the following structure:

{
  "quickTake": string,
  "trendInsights": string[],
  "bandNotes": { [band: string]: string },
  "advice": string,
  "alerts": [
    {
      "type": string,
      "description": string,
      "severity": "low" | "medium" | "high",
      "issued": string
    }
  ],
  "forecast24h": [],
  "generatedAt": string
}

Rules:
- DO NOT include commentary outside the JSON.
- DO NOT include markdown fences.
- "generatedAt" must be the current time in ISO format.
- DO NOT generate DX/SNR/absorption or MUF. These are deterministic.
- "forecast24h" must be returned as an empty array (we will fill it deterministically).
`;

  // ---------------------------------------------------------
  // AI CALL WITH FALLBACK
  // ---------------------------------------------------------
  let aiResponse: string | null = null;

  for (const provider of ["groq", "deepseek"] as ProviderName[]) {
    try {
      aiResponse = await tryProvider(provider, systemPrompt, payload);
      break;
    } catch (err) {
      console.error(`Provider ${provider} failed:`, err);
    }
  }

  if (!aiResponse) {
    return NextResponse.json({
      quickTake: "AI commentary unavailable.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      alerts: deterministicAlerts,
      forecast24h: current.forecast24h,
      generatedAt: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // Extract JSON
  // ---------------------------------------------------------
  let parsed: any;

  try {
    parsed = JSON.parse(extractJson(aiResponse));
  } catch (err) {
    console.error("JSON parse error:", err);
    parsed = {
      quickTake: "AI commentary parsing error.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      alerts: [],
      forecast24h: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // ---------------------------------------------------------
  // Merge deterministic + AI alerts
  // ---------------------------------------------------------
  const aiAlerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
  const mergedAlerts = [...deterministicAlerts, ...aiAlerts];

  const now = new Date();
  const validAlerts = mergedAlerts.filter((alert) => {
    if (!alert?.issued) return true;
    const issued = new Date(alert.issued);
    if (isNaN(issued.getTime())) return true;
    const ageHours = (now.getTime() - issued.getTime()) / 1000 / 3600;
    return ageHours < 24;
  });

  // ---------------------------------------------------------
  // Final return (deterministic forecast)
  // ---------------------------------------------------------
  return NextResponse.json({
    quickTake: parsed.quickTake,
    trendInsights: parsed.trendInsights,
    bandNotes: parsed.bandNotes,
    advice: parsed.advice,
    alerts: validAlerts,
    forecast24h: current.forecast24h,
    generatedAt: parsed.generatedAt || new Date().toISOString(),
  });
}