"use client";

import { useSummaryData } from "../hooks/useSummaryData";

export default function StatusBar() {
  const { data, isLoading } = useSummaryData();

  if (isLoading)
    return (
      <div className="w-full text-xs text-neutral-400 py-1 px-3 border-t border-neutral-800">
        Loading status…
      </div>
    );

  // Use hybrid-scored current hour
  const bands = data?.forecast24h?.[0]?.bands;
  const prevBands = data?.forecast24h?.[1]?.bands;

  if (!bands)
    return (
      <div className="w-full text-xs text-neutral-400 py-1 px-3 border-t border-neutral-800">
        No band data.
      </div>
    );

  const entries = Object.entries(bands).map(([band, stats]: any) => {
    const dxNow = Math.round(stats.dx ?? 0);
    const dxPrev = Math.round(prevBands?.[band]?.dx ?? dxNow);
    const delta = dxNow - dxPrev;

    let trend = "➖";
    if (delta > 3) trend = "📈";
    else if (delta < -3) trend = "📉";

    return { band, dxNow, trend };
  });

  const best = entries.sort((a, b) => b.dxNow - a.dxNow)[0];

  const text = best
    ? `Best band: ${best.band} ${best.trend} — ${best.dxNow}% DX`
    : "No band data";

  return (
    <div className="w-full text-xs text-neutral-400 py-1 px-3 border-t border-neutral-800">
      {text}
    </div>
  );
}