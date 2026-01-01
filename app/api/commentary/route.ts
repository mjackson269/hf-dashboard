import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// DeepSeek / OpenAI-compatible client
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com", // adjust if needed
});

export async function GET() {
  const origin = "https://hf-dashboard-weld.vercel.app";

  let current = null;

  // ---------------------------------------------------------
  // Fetch live propagation data
  // ---------------------------------------------------------
  try {
    const res = await fetch(`${origin}/api/current`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    current = await res.json();
  } catch (err) {
    return NextResponse.json({
      quickTake: "Propagation commentary unavailable.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      generatedAt: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // Build payload for the AI
  // ---------------------------------------------------------
  const payload = {
    sfi: current.sfiEstimated,
    kp: current.kp,
    muf: current.muf,
    bands: current.bands,
    score: current.score,
    forecast24h: current.forecast24h,
  };

  // ---------------------------------------------------------
  // Operator-grade system prompt
  // ---------------------------------------------------------
  const systemPrompt = `
You are an HF radio propagation analyst generating a concise, operator-grade briefing for UK amateur radio conditions. 
Your tone is factual, confident, and technically aware. Avoid filler language.

You will receive:
- Solar Flux Index (SFI)
- Estimated Kp index (kp)
- Maximum Usable Frequency (MUF)
- Band performance data (snr, absorption, dx probability)
- A computed propagation score (0–100)
- A 24h MUF/DX forecast

Produce a JSON object with the following fields:

{
  "quickTake": string,
  "trendInsights": string[],
  "bandNotes": { [band: string]: string },
  "advice": string,
  "generatedAt": string
}

Guidelines:

1. QUICK TAKE
   - 1–2 sentences.
   - Summarise overall HF conditions.
   - Mention the key drivers (e.g., high MUF, quiet geomagnetic field, low SFI, rising Kp).
   - Keep it sharp and actionable.

2. TREND INSIGHTS
   - Provide 3–5 bullet points.
   - Comment on:
     • SFI trend (strong, moderate, weak)
     • Kp stability (quiet, unsettled, rising, storm risk)
     • MUF behaviour (opening, falling, stable)
     • Any notable forecast patterns in the next 24h
   - Use operator language, not generic AI phrasing.

3. BAND NOTES
   - For each band provided (e.g., 80m, 40m, 20m, 15m, 10m):
     • Mention expected performance (local NVIS, regional, DX)
     • Reference SNR, absorption, and DX probability
     • Keep each note to 1–2 sentences
   - If a band is poor, explain why (e.g., low MUF, high absorption).

4. OPERATOR ADVICE
   - Provide practical guidance:
     • Best bands to try now
     • Expected DX windows
     • Whether conditions favour low, mid, or high bands
     • Any cautions (e.g., rising Kp may degrade higher bands)
   - Keep it concise and useful.

5. TIMESTAMP
   - Set "generatedAt" to the current time in HH:MM format (local UK time).

Do NOT include any text outside the JSON object.
`;

  // ---------------------------------------------------------
  // Call DeepSeek / OpenAI-compatible API
  // ---------------------------------------------------------
  let aiResponse;

  try {
    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(payload) },
      ],
      temperature: 0.4,
    });

    aiResponse = completion.choices[0].message.content;
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json({
      quickTake: "AI commentary unavailable.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      generatedAt: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // Parse JSON safely
  // ---------------------------------------------------------
  let parsed;

  try {
    const cleaned = aiResponse
  .replace(/^```json/, "")
  .replace(/^```/, "")
  .replace(/```$/, "")
  .trim();

parsed = JSON.parse(cleaned);;
  } catch (err) {
    console.error("JSON parse error:", err);
    parsed = {
      quickTake: "AI commentary parsing error.",
      trendInsights: [],
      bandNotes: {},
      advice: "No operator advice available.",
      generatedAt: new Date().toISOString(),
    };
  }

  return NextResponse.json(parsed);
}