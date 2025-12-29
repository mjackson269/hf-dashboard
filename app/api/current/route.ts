// app/api/current/route.ts

// Revalidate every 5 minutes
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

  for (let i = lines.length