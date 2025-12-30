import { NextResponse } from "next/server";

// ------------------------------
// NOAA + Solar Data Fetch
// ------------------------------
async function fetchSolarData() {
  const url = "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json";

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
// Forecast Fetch
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
    const [solar, forecast] = await Promise.all([
      fetchSolarData(),
      fetchForecast(),
    ]);

    const scoring = computeScore(solar);
    const bestBand = computeBestBand(scoring.score);

    return NextResponse.json({
      ok: true,
      solar,
      forecast,
      scoring,
      bestBand,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("SUMMARY ROUTE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}