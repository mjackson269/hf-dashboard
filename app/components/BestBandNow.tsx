"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card } from "../lib/designSystem";

const bands = ["80m", "40m", "20m", "15m", "10m"] as const;
type BandKey = (typeof bands)[number];

export default function BestBandNow() {
  const { data, isLoading } = useSummaryData();

  const forecast = Array.isArray(data?.forecast24h) ? data.forecast24h : [];

  const nowStep = forecast[0];
  const dxMap = nowStep?.dxProbability ?? {};

  let bestBand: BandKey = "80m";
  let bestDX = -1;

  for (const band of bands) {
    const dx = dxMap[band] ?? 0;
    if (dx > bestDX) {
      bestDX = dx;
      bestBand = band;
    }
  }

  const isReady = !isLoading && forecast.length > 0 && bestDX >= 0;

  return (
    <div className={card}>
      {isReady ? (
        <div className="text-sm text-neutral-300">
          <span className="mr-2">📡 <strong>Best Band Now:</strong></span>
          <span className="text-emerald-400 font-semibold">{bestBand}</span>
          <span className="text-neutral-400 ml-1">({bestDX}% DX)</span>
        </div>
      ) : (
        <span className="text-sm text-neutral-400">Calculating best band…</span>
      )}
    </div>
  );
}