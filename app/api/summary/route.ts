import { NextResponse } from "next/server";

// ------------------------------
// NOAA + Solar Data Fetch
// ------------------------------
async function fetchSolarData() {
  const url =
    "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch solar data");

  const json = await res.json();
  const latest = json[json.length - 1];

  return {
    ssn: latest.ssn,
    smoothed_ssn: latest.smoothed_ssn,
    date: latest.time_tag,
  };
}

// ------------------------------
// Forecast Fetch (currently offline)
// ------------------------------
async function fetchForecast() {
  const url = "https://services.swpc.noaa.gov/json/27-day-outlook.json";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch forecast");

  return await res.json();
}

// ------------------------------
// Internal Current Fetch (patched)
// ------------------------------
async function fetchCurrent() {
  const origin = "https://hf-dashboard-weld.vercel.app";
  const res = await fetch(`${origin}/api/current`, { cache: "no-store" });
  const raw = await res.text();

  if (!res.ok) {
    console.error("ERROR calling /api/current:", res.status, raw.slice(0, 200));
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    console.error("Invalid JSON from /api/current:", raw.slice(0, 200));
    return null;
  }
}

// ------------------------------
// Scoring Model
// ------------------------------
function computeScore(solar: any) {
  const ssn = solar.ssn ?? 0;

  let score = 0;
  if (ssn > 150) score = 90;
  else if (ssn > 120) score = 80;
  else if (ssn > 90) score = 70;
  else if (ssn > 60) score = 60;
  else if (ssn > 30) score = 50;
  else score = 40;

  return {
    score,
    ssn,
    smoothed_ssn: solar.smoothed_ssn,
  };
}

// ------------------------------
// Best Band Now (simple model)
// ------------------------------
function computeBestBand(score: number) {
  if (score >= 80) return "20m";
  if (score >= 70) return "17m";
  if (score >= 60) return "15m";
  return "40m";
}

// ------------------------------
// AI Commentary Generator
// ------------------------------
function generateCommentary(score: number, ssn: number) {
  return {
    markdown: `Solar activity is moderate. SSN is ${ssn.toFixed(1)}. Conditions are improving.`,
    quickTake: score >= 70
      ? "Expect decent propagation on 17m and 15m."
      : "HF conditions are fair. 40m may be more reliable.",
    severity: score >= 80 ? "Low" : score >= 60 ? "Moderate" : "High",
    reason: score >= 70
      ? "SSN is rising and Kp is stable."
      : "SSN is low and noise levels may be elevated.",
  };
}

// ------------------------------
// API Route
// ------------------------------
export async function GET() {
  try {
    const solar = await fetchSolarData();
    const current = await fetchCurrent();

    let forecast = null;
    try {
      forecast = await fetchForecast();
    } catch {
      console.warn("Forecast data unavailable — NOAA endpoint returned 404");
    }

    const scoring = computeScore(solar);
    const bestBand = computeBestBand(scoring.score);
    const commentary = generateCommentary(scoring.score, solar.ssn);

    return NextResponse.json({
      ok: true,
      markdown: commentary.markdown,
      quickTake: commentary.quickTake,
      severity: commentary.severity,
      reason: commentary.reason,
      score: scoring.score,
      bestBand,
      bands: current?.bands ?? null,
      solar,
      current,
      forecast,
      scoring,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("SUMMARY ROUTE ERROR:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Unknown error",
        fallback: {
          markdown: "Summary unavailable.",
          quickTake: "No data available.",
          severity: "Unknown",
          reason: "Upstream error",
          score: 50,
          bestBand: "40m",
        },
      },
      { status: 500 }
    );
  }
}