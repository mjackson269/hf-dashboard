import { NextResponse } from "next/server";

// ---------------------------------------------------------
// Fetch NOAA Solar Data
// ---------------------------------------------------------
async function fetchSolarData() {
  const url =
    "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch solar data");

  const json = await res.json();
  const latest = json[json.length - 1];

  return {
    ssn: latest.ssn ?? 0,
    smoothed_ssn: latest.smoothed_ssn ?? 0,
    date: latest.time_tag,
  };
}

// ---------------------------------------------------------
// Fetch NOAA 27‑day Forecast
// ---------------------------------------------------------
async function fetchForecast() {
  const url = "https://services.swpc.noaa.gov/json/27-day-outlook.json";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch forecast");

  return await res.json();
}

// ---------------------------------------------------------
// Extract 24h Forecast + DX Probability
// ---------------------------------------------------------
function extractForecast24h(raw: any[]) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        dxProbability: {
          "80m": 0,
          "40m": 0,
          "20m": 0,
          "15m": 0,
          "10m": 0,
        },
      },
    ];
  }

  const step = raw[0];

  return [
    {
      dxProbability: {
        "80m": step.prob_80m ?? 0,
        "40m": step.prob_40m ?? 0,
        "20m": step.prob_20m ?? 0,
        "15m": step.prob_15m ?? 0,
        "10m": step.prob_10m ?? 0,
      },
    },
  ];
}

// ---------------------------------------------------------
// Fetch Internal /api/current
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// Scoring Model
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// Best Band (simple model)
// ---------------------------------------------------------
function computeBestBand(score: number) {
  if (score >= 80) return "20m";
  if (score >= 70) return "17m";
  if (score >= 60) return "15m";
  return "40m";
}

// ---------------------------------------------------------
// Commentary Generator
// ---------------------------------------------------------
function generateCommentary(score: number, ssn: number) {
  return {
    markdown: `Solar activity is moderate. SSN is ${ssn.toFixed(
      1
    )}. Conditions are improving.`,
    quickTake:
      score >= 70
        ? "Expect decent propagation on 17m and 15m."
        : "HF conditions are fair. 40m may be more reliable.",
    severity: score >= 80 ? "Low" : score >= 60 ? "Moderate" : "High",
    reason:
      score >= 70
        ? "SSN is rising and Kp is stable."
        : "SSN is low and noise levels may be elevated.",
  };
}

// ---------------------------------------------------------
// API Route
// ---------------------------------------------------------
export async function GET() {
  try {
    const solar = await fetchSolarData();
    const current = await fetchCurrent();

    let forecastRaw = [];
    try {
      forecastRaw = await fetchForecast();
    } catch {
      console.warn("Forecast unavailable — NOAA endpoint returned error");
    }

    const forecast24h = extractForecast24h(forecastRaw);

    const scoring = computeScore(solar);
    const bestBand = computeBestBand(scoring.score);
    const commentary = generateCommentary(scoring.score, solar.ssn);

    return NextResponse.json({
      ok: true,

      // AI summary fields
      markdown: commentary.markdown,
      quickTake: commentary.quickTake,
      severity: commentary.severity,
      reason: commentary.reason,
      score: scoring.score,
      bestBand,

      // Band data (from /api/current)
      bands: current?.bands ?? null,

      // Forecast data (for BestBandNow)
      forecast24h,

      // Raw data
      solar,
      current,
      forecast: forecastRaw,
      scoring,

      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("SUMMARY ROUTE ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message ?? "Unknown error",
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