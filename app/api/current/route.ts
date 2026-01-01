import { NextResponse } from "next/server";

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------
type BandKey = "80m" | "40m" | "20m" | "15m" | "10m";

interface BandState {
  snr: number;
  absorption: number;
  dx: number;
}

interface CurrentHFState {
  muf: number;
  sfi: number;
  kp: number;
  solarWind: {
    speed: number | null;
    density: number | null;
    bz: number | null;
    bt: number | null;
  };
  xray: {
    flux: number | null;
    class: string | null;
  };
  protons: {
    p10: number | null;
    p50: number | null;
    p100: number | null;
  };
  bands: Record<BandKey, BandState>;
  timestamp: string;
}

// ---------------------------------------------------------
// Constants
// ---------------------------------------------------------
const BANDS: BandKey[] = ["80m", "40m", "20m", "15m", "10m"];

const BAND_FREQ: Record<BandKey, number> = {
  "80m": 3.6,
  "40m": 7.1,
  "20m": 14.1,
  "15m": 21.1,
  "10m": 28.5,
};

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
function classifyXrayClass(flux: number | null): string | null {
  if (flux == null) return null;
  // GOES X-ray flux in W/m^2
  if (flux >= 1e-4) return "X";
  if (flux >= 1e-5) return "M";
  if (flux >= 1e-6) return "C";
  if (flux >= 1e-7) return "B";
  return "A";
}

function computeMufComputed(sfi: number, kp: number, bz: number | null): number {
  // Simple, smooth MUF model
  let muf = 12 + (sfi - 70) * 0.1 - kp * 0.5;
  if (bz != null && bz < 0) muf -= 1;
  return Math.max(5, Math.min(40, muf));
}

function weightedHybridMuf(noaaMuf: number | null, computedMuf: number): number {
  if (noaaMuf == null || Number.isNaN(noaaMuf)) return computedMuf;
  return 0.7 * noaaMuf + 0.3 * computedMuf;
}

function buildBandModel(
  muf: number,
  kp: number,
  xrayClass: string | null,
  protons: { p10: number | null; p50: number | null; p100: number | null }
): Record<BandKey, BandState> {
  const bands: Record<BandKey, BandState> = {} as any;

  for (const band of BANDS) {
    const freq = BAND_FREQ[band];
    const ratio = muf / freq;

    // Base SNR from MUF ratio
    let snr = 10 + (ratio - 1) * 15; // around 10–35 dB
    snr -= kp * 1.5; // Kp penalty

    // X-ray absorption penalty
    let absorption = 0.5 * kp;
    if (xrayClass === "M") absorption += 3;
    if (xrayClass === "X") absorption += 6;

    // Proton storm penalty
    const protonLevel =
      (protons.p10 ?? 0) + (protons.p50 ?? 0) + (protons.p100 ?? 0);
    if (protonLevel > 10) {
      absorption += 3;
      snr -= 3;
    }

    // DX probability (moderate model)
    let dx = Math.max(0, Math.min(100, (ratio - 0.6) * 120)); // opens around ratio ~0.8
    dx -= kp * 5;
    if (xrayClass === "M") dx -= 10;
    if (xrayClass === "X") dx -= 25;
    if (protonLevel > 10) dx -= 15;

    snr = Math.max(0, Math.min(40, snr));
    absorption = Math.max(0, Math.min(20, absorption));
    dx = Math.max(0, Math.min(100, dx));

    bands[band] = {
      snr: Number(snr.toFixed(1)),
      absorption: Number(absorption.toFixed(1)),
      dx: Math.round(dx),
    };
  }

  return bands;
}

// ---------------------------------------------------------
// NOAA Fetchers
// ---------------------------------------------------------
async function fetchSolarWind() {
  try {
    const [magRes, plasmaRes] = await Promise.all([
      fetch(
        "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
        { cache: "no-store" }
      ),
      fetch(
        "https://services.swpc.noaa.gov/json/rtsw/rtsw_plasma_1m.json",
        { cache: "no-store" }
      ),
    ]);

    if (!magRes.ok || !plasmaRes.ok) throw new Error("Solar wind fetch failed");

    const mag = await magRes.json();
    const plasma = await plasmaRes.json();

    const latestMag = mag[mag.length - 1] ?? {};
    const latestPlasma = plasma[plasma.length - 1] ?? {};

    return {
      speed: latestPlasma.speed ?? null,
      density: latestPlasma.density ?? null,
      bz: latestMag.bz_gsm ?? latestMag.bz ?? null,
      bt: latestMag.bt ?? null,
    };
  } catch {
    return {
      speed: null,
      density: null,
      bz: null,
      bt: null,
    };
  }
}

async function fetchXray() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("X-ray fetch failed");
    const json = await res.json();
    const latest = json[json.length - 1] ?? {};
    const flux = latest?.flux ?? null;
    return {
      flux,
      class: classifyXrayClass(flux),
    };
  } catch {
    return {
      flux: null,
      class: null,
    };
  }
}

async function fetchProtons() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Proton fetch failed");
    const json = await res.json();
    const latest = json[json.length - 1] ?? {};
    return {
      p10: latest?.p10 ?? null,
      p50: latest?.p50 ?? null,
      p100: latest?.p100 ?? null,
    };
  } catch {
    return {
      p10: null,
      p50: null,
      p100: null,
    };
  }
}

async function fetchKp() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Kp fetch failed");
    const json = await res.json();
    const latest = json[json.length - 1] ?? {};
    const kp = latest?.kp_index ?? latest?.kp ?? 2;
    return Number(kp) || 2;
  } catch {
    return 2;
  }
}

async function fetchSfi() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/json/f107_cm_flux.json",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("SFI fetch failed");
    const json = await res.json();
    const latest = json[json.length - 1] ?? {};
    const sfi = latest?.f107 ?? latest?.flux ?? 100;
    return Number(sfi) || 100;
  } catch {
    return 100;
  }
}

async function fetchNoaaMufChilton() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/json/ionosphere/mufd.json",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("MUF fetch failed");
    const json = await res.json();

    // Find Chilton-like station (name often includes "Chilton" or similar)
    const chilton = json
      .filter((entry: any) =>
        typeof entry.station === "string" &&
        /chilton/i.test(entry.station)
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.time_tag).getTime() - new Date(a.time_tag).getTime()
      )[0];

    if (!chilton) return null;

    const muf = chilton?.mufd ?? chilton?.muf ?? null;
    if (muf == null) return null;

    // Basic freshness check: within last 3 hours
    const t = new Date(chilton.time_tag).getTime();
    const ageHours = (Date.now() - t) / (1000 * 60 * 60);
    if (ageHours > 3) return null;

    return Number(muf) || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------
// API Route
// ---------------------------------------------------------
export async function GET() {
  try {
    const [solarWind, xray, protons, kp, sfi, noaaMuf] = await Promise.all([
      fetchSolarWind(),
      fetchXray(),
      fetchProtons(),
      fetchKp(),
      fetchSfi(),
      fetchNoaaMufChilton(),
    ]);

    const computedMuf = computeMufComputed(sfi, kp, solarWind.bz);
    const muf = weightedHybridMuf(noaaMuf, computedMuf);

    const bands = buildBandModel(muf, kp, xray.class, protons);

    const payload: CurrentHFState = {
      muf: Number(muf.toFixed(1)),
      sfi: Number(sfi.toFixed(1)),
      kp,
      solarWind,
      xray,
      protons,
      bands,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("CURRENT ROUTE ERROR:", err);
    return NextResponse.json(
      {
        error: err?.message ?? "Unknown error",
        fallback: {
          muf: 14,
          sfi: 100,
          kp: 2,
          bands: {
            "80m": { snr: 15, absorption: 2, dx: 30 },
            "40m": { snr: 18, absorption: 2, dx: 40 },
            "20m": { snr: 22, absorption: 1.5, dx: 55 },
            "15m": { snr: 20, absorption: 1.5, dx: 45 },
            "10m": { snr: 18, absorption: 1, dx: 35 },
          } as Record<BandKey, BandState>,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}