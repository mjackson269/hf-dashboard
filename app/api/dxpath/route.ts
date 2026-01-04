import { NextResponse } from "next/server";

type Spot = {
  snr: number;
  timestamp: number;
  distance?: number | null;
  txGrid?: string;
  senderGrid?: string;
};

type RegionBands = Record<string, Spot[]>;

type DXRegionData = {
  wspr: RegionBands;
  ft8: RegionBands;
};

const REGIONS = [
  "Europe",
  "NorthAmerica",
  "SouthAmerica",
  "Africa",
  "Asia",
  "Oceania",
] as const;

type RegionName = (typeof REGIONS)[number];

type DXPathStatus = "open" | "marginal" | "closed";

type DXPathResult = {
  status: DXPathStatus;
  confidence: number;
  bestBand: string | null;
  evidence: {
    wsprSpots: number;
    ft8Spots: number;
    recentWspr: boolean;
    recentFt8: boolean;
    bandsWithActivity: string[];
  };
  notes: string[];
};

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

// Stub for your deterministic engine hook
// You can wire this into your existing MUF/SNR/absorption logic later.
function getDeterministicSupport(region: RegionName, band: string) {
  // For now, just return neutral support.
  return {
    viable: true,
    score: 0.5,
    notes: [] as string[],
  };
}

function evaluateRegion(
  region: RegionName,
  wspr: RegionBands,
  ft8: RegionBands
): DXPathResult {
  const now = Date.now() / 1000;
  const recentThreshold = 60 * 60; // 1 hour

  let wsprSpots = 0;
  let ft8Spots = 0;
  let recentWspr = false;
  let recentFt8 = false;
  const bandsWithActivity = new Set<string>();
  const notes: string[] = [];

  // Count WSPR
  for (const [band, spots] of Object.entries(wspr || {})) {
    if (!spots || spots.length === 0) continue;
    wsprSpots += spots.length;
    bandsWithActivity.add(band);
    if (spots.some((s) => now - s.timestamp < recentThreshold)) {
      recentWspr = true;
    }
  }

  // Count FT8
  for (const [band, spots] of Object.entries(ft8 || {})) {
    if (!spots || spots.length === 0) continue;
    ft8Spots += spots.length;
    bandsWithActivity.add(band);
    if (spots.some((s) => now - s.timestamp < recentThreshold)) {
      recentFt8 = true;
    }
  }

  const totalSpots = wsprSpots + ft8Spots;

  if (totalSpots === 0) {
    notes.push("No WSPR or FT8 spots from UK to this region in the last window.");
    return {
      status: "closed",
      confidence: 0.7,
      bestBand: null,
      evidence: {
        wsprSpots,
        ft8Spots,
        recentWspr,
        recentFt8,
        bandsWithActivity: [],
      },
      notes,
    };
  }

  // Score bands by combined spot count + recency + deterministic support
  const bandScores: Record<
    string,
    { score: number; wspr: number; ft8: number }
  > = {};

  for (const [band, spots] of Object.entries(wspr || {})) {
    if (!bandScores[band]) bandScores[band] = { score: 0, wspr: 0, ft8: 0 };
    bandScores[band].wspr += spots.length;
    const recentBoost = spots.some((s) => now - s.timestamp < recentThreshold)
      ? 1
      : 0;
    bandScores[band].score += spots.length * 0.6 + recentBoost * 1.0;
  }

  for (const [band, spots] of Object.entries(ft8 || {})) {
    if (!bandScores[band]) bandScores[band] = { score: 0, wspr: 0, ft8: 0 };
    bandScores[band].ft8 += spots.length;
    const recentBoost = spots.some((s) => now - s.timestamp < recentThreshold)
      ? 1
      : 0;
    bandScores[band].score += spots.length * 0.4 + recentBoost * 0.8;
  }

  // Blend in deterministic support
  for (const band of Object.keys(bandScores)) {
    const det = getDeterministicSupport(region, band);
    bandScores[band].score *= 0.7 + det.score * 0.6; // 0.7–1.3 multiplier
    if (!det.viable) {
      bandScores[band].score *= 0.3; // heavily penalize non-viable bands
    }
  }

  const sortedBands = Object.entries(bandScores).sort(
    (a, b) => b[1].score - a[1].score
  );

  const bestBand = sortedBands[0]?.[0] ?? null;
  const bestScore = sortedBands[0]?.[1]?.score ?? 0;

  let status: DXPathStatus;
  let confidence: number;

  if (bestScore > 10 && totalSpots > 10 && (recentWspr || recentFt8)) {
    status = "open";
    confidence = 0.9;
    notes.push(
      `Strong real-world activity on ${bestBand} with multiple recent WSPR/FT8 spots.`
    );
  } else if (bestScore > 3 && totalSpots > 3) {
    status = "marginal";
    confidence = 0.6;
    notes.push(
      `Some real-world activity on ${bestBand}, but spot density or recency is limited.`
    );
  } else {
    status = "closed";
    confidence = 0.5;
    notes.push(
      `Very low real-world activity; path likely closed or only weakly open.`
    );
  }

  notes.push(
    `WSPR spots: ${wsprSpots}, FT8 spots: ${ft8Spots}, bands with activity: ${Array.from(
      bandsWithActivity
    ).join(", ") || "none"}.`
  );

  return {
    status,
    confidence,
    bestBand,
    evidence: {
      wsprSpots,
      ft8Spots,
      recentWspr,
      recentFt8,
      bandsWithActivity: Array.from(bandsWithActivity),
    },
    notes,
  };
}

export async function GET() {
  const [wsprData, ft8Data]: [DXRegionData, DXRegionData] = await Promise.all([
    fetchJson(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/wspr`),
    fetchJson(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/ft8`),
  ]);

  const results: Record<RegionName, DXPathResult> = {} as any;

  for (const region of REGIONS) {
    const wsprRegion = (wsprData as any)[region] || {};
    const ft8Region = (ft8Data as any)[region] || {};

    results[region] = evaluateRegion(
      region,
      wsprRegion as RegionBands,
      ft8Region as RegionBands
    );
  }

  return NextResponse.json(results);
}