import { NextResponse } from "next/server";

// ---------------------------------------------------------
// Fetch NOAA Solar Data
// ---------------------------------------------------------
async function fetchSolarData() {
  try {
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
  } catch {
    console.warn("Solar data unavailable — using fallback");
    return {
      ssn: 90,
      smoothed_ssn: 85,
      date: new Date().toISOString(),
    };
  }
}

// ---------------------------------------------------------
// Fetch NOAA 3‑day Kp forecast
// ---------------------------------------------------------
async function fetchKpForecast() {
  const url = "https://services.swpc.noaa.gov/json/geomag_forecast.json";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch Kp forecast");

  return await res.json();
}

// ---------------------------------------------------------
// Fetch NOAA 3‑day Solar Flux forecast
// ---------------------------------------------------------
async function fetchSfiForecast() {
  const url = "https://services.swpc.noaa.gov/json/f107_cm_flux.json";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch SFI forecast");

  return await res.json();
}

// ---------------------------------------------------------
// Fetch Internal /api/current
// ---------------------------------------------------------
async function fetchCurrent() {
  const origin = "https://hf-dashboard-weld.vercel.app";

  try {
    const res = await fetch(`${origin}/api/current`, { cache: "no-store" });
    const raw = await res.text();

    if (!res.ok) {
      console.error("ERROR calling /api/current:", res.status, raw.slice(0, 200));
      return null;
    }

    return JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON from /api/current");
    return null;
  }
}

// ---------------------------------------------------------
// Build 24h forecast from NOAA Kp + SFI
// ---------------------------------------------------------
function build24hForecast(kpData: any[], sfiData: any[]) {
  const steps = [];

  const kp = kpData?.[0]?.kp_predicted ?? 2;
  const sfi = sfiData?.[0]?.f107 ?? 100;

  for (let i = 0; i < 24; i++) {
    const hour = `${String(i).padStart(2, "0")}:00`;

    const muf = 12 + (sfi - 70) * 0.1;

    steps.push({
      timeLabel: hour,
      muf: Number(muf.toFixed(1)),
      dxProbability: {
        "80m": Math.max(0, 100 - kp * 10),
        "40m": Math.max(0, 100 - kp * 8),
        "20m": Math.max(0, 100 - kp * 6),
        "15m": Math.max(0, 100 - kp * 5),
        "10m": Math.max(0, 100 - kp * 4),
      },
      snr: {
        "80m": 20 - kp,
        "40m": 22 - kp,
        "20m": 25 - kp,
        "15m": 28 - kp,
        "10m": 30 - kp,
      },
      absorption: {
        "80m": kp * 0.8,
        "40m": kp * 0.6,
        "20m": kp * 0.4,
        "15m": kp * 0.3,
        "10m": kp * 0.2,
      },
    });
  }

  return steps;
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

    let kpForecast = [];
    let sfiForecast = [];

    try {
      kpForecast = await fetchKpForecast();
      sfiForecast = await fetchSfiForecast();
    } catch {
      console.warn("NOAA forecast unavailable — using fallback");
    }

    const forecast24h = build24hForecast(kpForecast, sfiForecast);

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
      forecast24h,
      solar,
      current,
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