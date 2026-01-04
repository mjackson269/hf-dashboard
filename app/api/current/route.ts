// /app/api/current/route.ts

import { NextResponse } from "next/server";
import { generateDeterministicMUF } from "@/app/lib/mufEngine";
import { generateDeterministicDX } from "@/app/lib/dxEngine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json",
      { cache: "no-store" }
    );

    const solar = await res.json();
    const latest = solar[solar.length - 1];

    const sfiEstimated = latest.ssn * 1.4; // or your preferred SFI source
    const kp = 2; // TODO: replace with real Kp fetch

    const mufCurve = generateDeterministicMUF(sfiEstimated, kp);
    const currentHour = new Date().getUTCHours();
    const muf = mufCurve[currentHour].muf;

    const bands = generateDeterministicDX({
      muf,
      sfi: sfiEstimated,
      kp,
    });

    const forecast24h = mufCurve.map((m) => ({
      timeLabel: `${String(m.hour).padStart(2, "0")}:00`,
      muf: m.muf,
      bands: generateDeterministicDX({
        muf: m.muf,
        sfi: sfiEstimated,
        kp,
      }),
    }));

    return NextResponse.json({
      sfiEstimated,
      kp,
      muf,
      bands,
      forecast24h,
      score: 0,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /api/current:", err);
    return NextResponse.json(
      { error: "Failed to fetch propagation data" },
      { status: 500 }
    );
  }
}