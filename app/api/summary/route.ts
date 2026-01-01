import { NextResponse } from "next/server";

// Fetch live current conditions
async function fetchCurrent() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/current`, {
    cache: "no-store",
  });
  return res.json();
}

// Compute a propagation score (0–100)
function computeScore(current: any) {
  const sfi = current.sfi ?? 0;
  const kp = current.kp ?? 0;
  const muf = current.muf ?? 0;

  // SFI contribution (scaled 0–1)
  const snrScore = Math.min(Math.max((sfi - 60) / 60, 0), 1);

  // Kp penalty
  const kpPenalty = kp >= 5 ? -0.5 : kp >= 3 ? -0.2 : 0;

  // MUF bonus
  const mufBonus = muf >= 14 ? 0.3 : muf >= 10 ? 0.1 : 0;

  // Raw score (0–130 possible)
  const rawScore = (snrScore + mufBonus + kpPenalty) * 100;

  // Option A: Hard cap at 100
  return Math.min(100, Math.round(rawScore));
}

// Generate simple commentary (placeholder for AI)
function generateCommentary(current: any, score: number) {
  return {
    quickTake:
      score >= 80
        ? "Conditions are favourable for DX, especially on the higher bands."
        : score >= 50
        ? "Mixed conditions. Some bands will perform well, others may be noisy."
        : "Propagation is weak. Expect limited DX performance.",
    details: {
      sfi: `SFI is currently ${current.sfi}.`,
      kp: `Geomagnetic activity (Kp ${current.kp}) is influencing stability.`,
      muf: `MUF is ${current.muf} MHz, affecting higher-band openings.`,
    },
  };
}

// Generate a simple 24h forecast (placeholder)
function generateForecast(current: any) {
  const base = current.muf ?? 10;

  return Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    muf: Math.max(5, base + Math.sin(hour / 3) * 2),
    dxProbability: Math.round(
      Math.max(0, Math.min(100, 50 + Math.sin(hour / 4) * 30))
    ),
  }));
}

export async function GET() {
  try {
    const current = await fetchCurrent();
    const score = computeScore(current);
    const commentary = generateCommentary(current, score);
    const forecast24h = generateForecast(current);

    return NextResponse.json({
      current,
      score,
      commentary,
      forecast24h,
      alerts: [],
    });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}