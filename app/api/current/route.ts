// app/api/current/route.ts

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SFI_TEXT_URL = "https://services.swpc.noaa.gov/text/daily-solar-indices.txt";
const KP_TEXT_URL = "https://services.swpc.noaa.gov/text/daily-geomagnetic-indices.txt";

// Fetch text with timeout
async function fetchText(url: string, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }

    return await res.text();
  } finally {
    clearTimeout(id);
  }
}

// ---- SFI PARSER ----
function parseLatestSfi(text: string): { sfi: number; prev: number } | null {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => /^\d{4}\s+\d{2}\s+\d{2}/.test(l));

  if (lines.length < 1) return null;

  const last = lines[lines.length - 1].split(/\s+/);
  const prev = lines[lines.length - 2]?.split(/\s+/) ?? last;

  const lastF = Number(last[3]);
  const prevF = Number(prev[3]);

  if (isNaN(lastF)) return null;

  return {
    sfi: lastF,
    prev: isNaN(prevF) ? lastF : prevF,
  };
}

// ---- Kp PARSER ----
function parseLatestKp(text: string): number | null {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => /^\d{4}\s+\d{2}\s+\d{2}/.test(l));

  if (lines.length === 0) return null;

  for (let i = lines.length - 1; i >= 0; i--) {
    const nums = lines[i]
      .split(/[^0-9.\-]+/)
      .filter(Boolean)
      .map(Number)
      .filter(n => !isNaN(n));

    const positives = nums.filter(n => n >= 0);
    const kpValues = positives.slice(-8);

    if (kpValues.length > 0) {
      return kpValues[kpValues.length - 1];
    }
  }

  return null;
}

// ---- Derived models ----
function deriveMufFromSfi(sfi: number): number {
  const base = 0.18 * sfi;
  const clamped = Math.max(8, Math.min(base, 35));
  return Number(clamped.toFixed(1));
}

function snrFromKp(kp: number): number {
  if (kp <= 1) return 30;
  if (kp <= 3) return 20;
  return 10;
}

export async function GET() {
  console.log(">>> CURRENT ROUTE IS RUNNING <<<");

  // Fallbacks
  let sfiEstimated = 145;
  let sfiEstimatedPrev = 143;
  let kp = 2;
  let kpPrev = 3;

  try {
    const [sfiText, kpText] = await Promise.all([
      fetchText(SFI_TEXT_URL),
      fetchText(KP_TEXT_URL),
    ]);

    // ---- Parse SFI ----
    const sfiParsed = parseLatestSfi(sfiText);
    if (sfiParsed) {
      sfiEstimatedPrev = sfiEstimated;
      sfiEstimated = sfiParsed.sfi;
      sfiEstimatedPrev = sfiParsed.prev;
    }

    // ---- Parse Kp ----
    const latestKp = parseLatestKp(kpText);
    if (latestKp !== null) {
      kpPrev = kp;
      kp = latestKp;
    }

  } catch (err) {
    console.error("[/api/current] Failed to fetch live data, using fallbacks:", err);
  }

  // ---- Derived values ----
  const sfiAdjusted = sfiEstimated;
  const sfiAdjustedPrev = sfiEstimatedPrev;

  const muf = deriveMufFromSfi(sfiAdjusted);
  const mufPrev = deriveMufFromSfi(sfiAdjustedPrev);

  const snr = snrFromKp(kp);

  // ---- Band model ----
  const bands = {
    "80m": { freq: 3.5, mufSupport: muf >= 3.5 ? "open" : "closed", snr },
    "40m": { freq: 7, mufSupport: muf >= 7 ? "open" : "closed", snr },
    "20m": { freq: 14, mufSupport: muf >= 14 ? "open" : "closed", snr },
    "15m": { freq: 21, mufSupport: muf >= 21 ? "open" : "marginal", snr },
    "10m": { freq: 28, mufSupport: muf >= 28 ? "open" : "closed", snr },
  };

  return Response.json({
    sfiEstimated,
    sfiEstimatedPrev,
    sfiAdjusted,
    sfiAdjustedPrev,
    kp,
    kpPrev,
    muf,
    mufPrev,
    bands,
  });
}