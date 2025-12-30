"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card } from "../lib/designSystem";

const bands = ["80m", "40m", "20m", "15m", "10m"] as const;
type BandKey = (typeof bands)[number];

export default function BestBandNow() {
  const { data, isLoading } = useSummaryData();
  const forecast = data?.forecast24h ?? [];

  if (isLoading || !forecast.length) {
    return (
      <div className={card}>
        <span className="text-sm text-neutral-400">Calculating best band…</span>
      </div>
    );
  }

  const nowStep = forecast[0];

  // Find the band with the highest DX probability
  let bestBand: BandKey = "80m";
  let bestDX = -1;

  for (const band of bands) {
    const dx = nowStep.dxProbability[band] ?? 0;
    if (dx > bestDX) {
      bestDX = dx;
      bestBand = band;
    }
  }

  return (
    <div className={card}>
      <div className="text-sm text-neutral-300">
        <span className="mr-2">📡 <strong>Best Band Now:</strong></span>
        <span className="text-emerald-400 font-semibold">{bestBand}</span>
        <span className="text-neutral-400 ml-1">({bestDX}% DX)</span>
      </div>
    </div>
  );
}