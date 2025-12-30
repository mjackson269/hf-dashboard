import { NextResponse } from "next/server";

// ------------------------------
// NOAA + Solar Data Fetch
// ------------------------------
async function fetchSolarData() {
  const url =
    "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json";

const baseUrl =
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

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
// API Route
// ------------------------------
export async function GET() {
  try {
    const solar = await fetchSolarData();

    // Forecast endpoint is currently offline — patch gracefully
    let forecast = null;
    try {
      forecast = await fetchForecast();
    } catch {
      console.warn("Forecast data unavailable — NOAA endpoint returned 404");
    }

    const scoring = computeScore(solar);
    const bestBand = computeBestBand(scoring.score);

    return NextResponse.json({
      ok: true,
      solar,
      forecast, // may be null — but no crash
      scoring,
      bestBand,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("SUMMARY ROUTE ERROR:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Unknown error",
        fallback: {
          scoring: { score: 50, ssn: 0, smoothed_ssn: 0 },
          bestBand: "40m",
        },
      },
      { status: 500 }
    );
  }
}