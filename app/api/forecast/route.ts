export const dynamic = "force-dynamic";
export const revalidate = 0;

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
// API Route
// ---------------------------------------------------------
export async function GET() {
  try {
    let kpForecast = [];
    let sfiForecast = [];

    try {
      kpForecast = await fetchKpForecast();
      sfiForecast = await fetchSfiForecast();
    } catch {
      console.warn("NOAA forecast unavailable — using fallback");
    }

    const forecast24h = build24hForecast(kpForecast, sfiForecast);

    return Response.json(forecast24h);
  } catch (err) {
    console.error("FORECAST ROUTE ERROR:", err);
    return Response.json([], { status: 200 });
  }
}