import { NextResponse } from "next/server";
import fallbackData from "@/app/data/ft8-fallback.json";

// -----------------------------
// Band classifier
// -----------------------------
function classifyBand(freqHz: number) {
  const mhz = freqHz / 1e6;
  if (mhz > 1.7 && mhz < 2.0) return "160m";
  if (mhz > 3.4 && mhz < 3.6) return "80m";
  if (mhz > 7.0 && mhz < 7.3) return "40m";
  if (mhz > 10.0 && mhz < 10.2) return "30m";
  if (mhz > 14.0 && mhz < 14.35) return "20m";
  if (mhz > 18.0 && mhz < 18.2) return "17m";
  if (mhz > 21.0 && mhz < 21.45) return "15m";
  if (mhz > 24.8 && mhz < 25.0) return "12m";
  if (mhz > 28.0 && mhz < 29.7) return "10m";
  return null;
}

export async function GET() {
  try {
    const url =
      "https://pskreporter.info/cgi-bin/pskdata.pl?format=json&flowStartSeconds=1800";

    let json: any = null;

    // ---------------------------------------------------
    // Try PSKReporter first
    // ---------------------------------------------------
    try {
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        throw new Error("PSKReporter returned " + res.status);
      }

      json = await res.json();

      if (!json?.receptionReports) {
        throw new Error("Malformed PSKReporter JSON");
      }
    } catch (err) {
      console.error("PSKReporter fetch failed, using fallback FT8:", err);

      // ---------------------------------------------------
      // Static JSON import (Turbopack-safe)
      // ---------------------------------------------------
      json = fallbackData;
    }

    // ---------------------------------------------------
    // Aggregate FT8 reports into band stats
    // ---------------------------------------------------
    const buckets: Record<
      string,
      {
        snrs: number[];
        maxDistance: number;
        lastHeard: number;
      }
    > = {};

    for (const rpt of json.receptionReports) {
      if (rpt.mode !== "FT8") continue;

      const freq = rpt.frequency;
      if (!freq) continue;

      const band = classifyBand(freq);
      if (!band) continue;

      if (!buckets[band]) {
        buckets[band] = {
          snrs: [],
          maxDistance: 0,
          lastHeard: 0,
        };
      }

      const bucket = buckets[band];

      if (typeof rpt.snr === "number") bucket.snrs.push(rpt.snr);
      if (typeof rpt.distance === "number")
        bucket.maxDistance = Math.max(bucket.maxDistance, rpt.distance);
      if (typeof rpt.flowStartSeconds === "number")
        bucket.lastHeard = Math.max(bucket.lastHeard, rpt.flowStartSeconds);
    }

    // ---------------------------------------------------
    // Convert buckets into final FT8 scoring structure
    // ---------------------------------------------------
    const result: any = {};

    for (const band of Object.keys(buckets)) {
      const { snrs, maxDistance, lastHeard } = buckets[band];

      const sorted = [...snrs].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);

      const medianSNR =
        sorted.length === 0
          ? 0
          : sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];

      result[band] = {
        count: snrs.length,
        maxDistance,
        medianSNR,
        lastHeard,
      };
    }
console.log("FT8 bands:", result);

    return NextResponse.json(result);
  } catch (err) {
    console.error("FT8 endpoint crashed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}