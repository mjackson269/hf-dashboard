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
// Provider selection
// ---------------------------------------------------------
function getProviderConfig(provider: string) {
  if (provider === "deepseek") {
    return {
      url: "https://api.deepseek.com/v1/chat/completions",
      model: "deepseek-chat",
      key: process.env.DEEPSEEK_API_KEY,
    };
  }

  // Default = Groq
  return {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    key: process.env.GROQ_API_KEY,
  };
}

// ---------------------------------------------------------
// MAIN ROUTE
// ---------------------------------------------------------
export async function GET() {
  const origin = "https://hf-dashboard-weld.vercel.app";

  let current: any = null;

  // ---------------------------------------------------------
  // Fetch live propagation data
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
  // Deterministic Alerts (Hybrid System Part 1)
  // ---------------------------------------------------------
  const deterministicAlerts = generateDeterministicAlerts(current);

  // ---------------------------------------------------------
  // Build payload for the AI
  // ---------------------------------------------------------
  const payload = {
    sfi: current.sfiEstimated,
    kp: current.kp,
    muf: current.muf,
    bands: current.bands,
    score: current.score,
    forecast24h: current.forecast24h ?? [],
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
  "forecast24h": [
    {
      "timeLabel": string,
      "muf": number,
      "bands": {
        "80m": { "snr": number, "absorption": number, "dx": number },
        "40m": { "snr": number, "absorption": number, "dx": number },
        "20m": { "snr": number, "absorption": number, "dx": number },
        "15m": { "snr": number, "absorption": number, "dx": number },
        "10m": { "snr": number, "absorption": number, "dx": number }
      }
    }
  ],
  "generatedAt": string
}

Rules:
- DO NOT include commentary outside the JSON.
- DO NOT include markdown fences.
- "generatedAt" must be the current time in ISO format.
- "forecast24h" must contain exactly 24 entries.
- MUF must follow a realistic diurnal curve.
- DX probability must reflect MUF, SNR, absorption, and band characteristics.
`;

  // ---------------------------------------------------------
  // Choose provider (default = groq)
  // ---------------------------------------------------------
  const provider = process.env.DEFAULT_AI_PROVIDER || "groq";
  const cfg = getProviderConfig(provider);

  if (!cfg.key) {
    console.error(`Missing API key for provider: ${provider}`);
    return NextResponse.json({
      quickTake: "AI provider unavailable.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      alerts: deterministicAlerts,
      forecast24h: [],
      generatedAt: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // Call AI provider with timeout
  // ---------------------------------------------------------
  let aiResponse: string;

  try {
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
      throw new Error(`Upstream ${provider} error: ${errText}`);
    }

    const data = await res.json();
    aiResponse = data.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("AI timeout or error:", err);
    return NextResponse.json({
      quickTake: "AI commentary unavailable.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      alerts: deterministicAlerts,
      forecast24h: [],
      generatedAt: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // Extract and parse JSON
  // ---------------------------------------------------------
  let parsed: any;

  try {
    const jsonString = extractJson(aiResponse);
    parsed = JSON.parse(jsonString);
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
  // Forecast validation
  // ---------------------------------------------------------
  const forecast24h =
    Array.isArray(parsed.forecast24h) &&
    parsed.forecast24h.length === 24
      ? parsed.forecast24h
      : [];

  // ---------------------------------------------------------
  // Final return
  // ---------------------------------------------------------
  return NextResponse.json({
    quickTake: parsed.quickTake,
    trendInsights: parsed.trendInsights,
    bandNotes: parsed.bandNotes,
    advice: parsed.advice,
    alerts: validAlerts,
    forecast24h,
    generatedAt: parsed.generatedAt || new Date().toISOString(),
  });
}