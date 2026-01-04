import { NextResponse } from "next/server";

type Region =
  | "Europe"
  | "NorthAmerica"
  | "SouthAmerica"
  | "Africa"
  | "Asia"
  | "Oceania";

interface BeaconBandStats {
  count: number;
  maxDistance: number;
  medianSNR: number;
  lastHeard: number;
}

type WsprResponse = Record<Region, Record<string, BeaconBandStats>>;

// -----------------------------
// Maidenhead → lat/lon
// -----------------------------
function maidenheadToLatLon(grid: string) {
  if (!grid || grid.length < 4) return null;
  const A = "A".charCodeAt(0);

  const lon =
    (grid.charCodeAt(0) - A) * 20 +
    parseInt(grid[2]) * 2 +
    (grid.length >= 6 ? (grid.charCodeAt(4) - A) / 12 : 0) -
    180;

  const lat =
    (grid.charCodeAt(1) - A) * 10 +
    parseInt(grid[3]) +
    (grid.length >= 6 ? (grid.charCodeAt(5) - A) / 24 : 0) -
    90;

  return { lat, lon };
}

// -----------------------------
// Region classifier
// -----------------------------
function classifyRegion(lat: number, lon: number): Region | "Unknown" {
  if (lon > -30 && lon < 40 && lat > 35 && lat < 70) return "Europe";
  if (lon < -30 && lon > -170 && lat > 10 && lat < 70) return "NorthAmerica";
  if (lon < -30 && lon > -90 && lat < 10 && lat > -60) return "SouthAmerica";
  if (lon > -20 && lon < 50 && lat < 35 && lat > -40) return "Africa";
  if (lon > 40 && lon < 150 && lat > 0 && lat < 70) return "Asia";
  if (lon > 120 && lon < 180 && lat < 0 && lat > -60) return "Oceania";
  return "Unknown";
}

// -----------------------------
// Frequency → band
// -----------------------------
function freqToBand(freqHz: number): string | null {
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

// -----------------------------
// MAIN ENDPOINT
// -----------------------------
export async function GET() {
  try {
    const url =
      "https://www.wsprnet.org/olddb?mode=csv&band=all&limit=200";

    let rows: any[] = [];

    // -----------------------------------------
    // 1. Try live WSPRNet CSV
    // -----------------------------------------
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("WSPRNet returned " + res.status);

      const csv = await res.text();
      if (!csv || csv.length < 100) throw new Error("CSV too short");

      const lines = csv
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const header = lines[0].split(",");
      const dataLines = lines.slice(1);

      rows = dataLines.map((line) => {
        const parts = line.split(",");
        return {
          timestamp: Number(parts[0]),
          freq: Number(parts[1]),
          snr: Number(parts[2]),
          drift: Number(parts[3]),
          tx_call: parts[4],
          tx_grid: parts[5],
          rx_grid: parts[6],
          distance: Number(parts[7]),
        };
      });
    } catch (err) {
      console.error("WSPRNet fetch failed, using fallback JSON:", err);

      // -----------------------------------------
      // 2. Load fallback JSON
      // -----------------------------------------
      const fallback = await import("@/app/data/wspr-fallback.json");
      rows = fallback.default;
    }

    // -----------------------------------------
    // 3. Aggregate into region/band buckets
    // -----------------------------------------
    const buckets: Record<
      Region,
      Record<
        string,
        {
          snrs: number[];
          maxDistance: number;
          lastHeard: number;
        }
      >
    > = {
      Europe: {},
      NorthAmerica: {},
      SouthAmerica: {},
      Africa: {},
      Asia: {},
      Oceania: {},
    };

    for (const rpt of rows) {
      if (!rpt.rx_grid?.startsWith("IO")) continue;

      const txLoc = maidenheadToLatLon(rpt.tx_grid);
      if (!txLoc) continue;

      const region = classifyRegion(txLoc.lat, txLoc.lon);
      if (region === "Unknown") continue;

      const band = freqToBand(rpt.freq);
      if (!band) continue;

      if (!buckets[region][band]) {
        buckets[region][band] = {
          snrs: [],
          maxDistance: 0,
          lastHeard: 0,
        };
      }

      const bucket = buckets[region][band];

      if (Number.isFinite(rpt.snr)) bucket.snrs.push(rpt.snr);
      if (Number.isFinite(rpt.distance))
        bucket.maxDistance = Math.max(bucket.maxDistance, rpt.distance);

      bucket.lastHeard = Math.max(bucket.lastHeard, rpt.timestamp);
    }

    // -----------------------------------------
    // 4. Convert to final scoring structure
    // -----------------------------------------
    const results: WsprResponse = {
      Europe: {},
      NorthAmerica: {},
      SouthAmerica: {},
      Africa: {},
      Asia: {},
      Oceania: {},
    };

    (Object.keys(buckets) as Region[]).forEach((region) => {
      const bands = buckets[region];

      Object.keys(bands).forEach((band) => {
        const { snrs, maxDistance, lastHeard } = bands[band];
        if (!snrs.length) return;

        const sorted = [...snrs].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        const medianSNR =
          sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];

        results[region][band] = {
          count: snrs.length,
          maxDistance,
          medianSNR,
          lastHeard,
        };
      });
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error("WSPR endpoint crashed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}