import { NextResponse } from "next/server";

// Compute DX score from SFI, Kp, MUF
function computeScore(current: any): number {
  const { sfi = 0, kp = 0, muf = 0 } = current;

  const snrScore = Math.min(Math.max((sfi - 60) / 60, 0), 1); // normalize SFI
  const kpPenalty = kp >= 5 ? -0.5 : kp >= 3 ? -0.2 : 0;
  const mufBonus = muf >= 14 ? 0.3 : muf >= 10 ? 0.1 : 0;

  return Math.round((snrScore + mufBonus + kpPenalty) * 100);
}

// AI commentary generator
function generateCommentary(current: any) {
  const { sfi = 0, kp = 0 } = current;

  return {
    quickTake: `Solar flux is ${sfi}, Kp is ${kp}.`,
    trendInsights: [
      `Solar flux trending at ${sfi}`,
      `Geomagnetic conditions stable at Kp ${kp}`,
    ],
    bandNotes: {
      "20m": "Strong daytime performance.",
      "40m": "Improves toward evening.",
    },
    operatorAdvice: "Monitor Kp for sudden spikes.",
  };
}

// OPTION A — Restore old forecast format with dxProbability
function generateForecast(current: any) {
  const bands = current?.bands ?? {};

  return Array.from({ length: 24 }, (_, i) => {
    const timeLabel = `${String(i).padStart(2, "0")}:00`;

    // Build dxProbability object expected by DXOutlook
    const dxProbability = Object.fromEntries(
      Object.entries(bands).map(([band, stats]: any) => [
        band,
        stats.dx ?? 0,
      ])
    );

    return {
      timeLabel,
      dxProbability,
    };
  });
}

// Static alerts (replace with NOAA feed later)
function fetchAlerts() {
  return [
    {
      type: "Solar Flare — M-class",
      message:
        "Moderate solar flare detected. Possible HF disruption in polar regions.",
      issued: "2025-12-22T18:00:00Z",
    },
    {
      type: "Geomagnetic Storm — G2",
      message:
        "Kp index elevated. Expect degraded conditions on 80m and 160m bands.",
      issued: "2025-12-22T12:00:00Z",
    },
  ];
}

export async function GET() {
  try {
    const res = await fetch("http://localhost:3000/api/current", {
      cache: "no-store",
    });

    const current = await res.json();

    const summary = {
      current,
      score: computeScore(current),
      commentary: generateCommentary(current),
      forecast24h: generateForecast(current), // ← Option A fix
      alerts: fetchAlerts(),
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("Summary API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch summary data" },
      { status: 500 }
    );
  }
}