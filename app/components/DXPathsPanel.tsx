"use client";

import React from "react";

function pct(value: number | undefined) {
  if (value === undefined || value === null) return 0;
  return Math.round(value);
}

export default function BestBandNow({ data }: { data: any }) {
  const current = data?.forecast24h?.[0]?.bands;
  const previous = data?.forecast24h?.[1]?.bands;

  // HARDENED GUARD: ensure current is a non-empty object
  if (
    !current ||
    typeof current !== "object" ||
    Object.keys(current).length === 0
  ) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md">
        <p>No band data available</p>
      </div>
    );
  }

  const sorted = Object.entries(current)
    .map(([band, info]: any) => {
      const dxNow = pct(info.dx);
      const dxPrev = pct(previous?.[band]?.dx);
      const delta = dxNow - dxPrev;

      let trend = "➖";
      if (delta > 3) trend = "📈";
      else if (delta < -3) trend = "📉";

      return { band, ...info, dxNow, dxPrev, delta, trend };
    })
    .sort((a, b) => b.dxNow - a.dxNow)
    .slice(0, 3);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Best DX Bands Right Now</h2>

      <div className="space-y-2">
        {sorted.map((b) => (
          <div
            key={b.band}
            className="border border-neutral-800 rounded-md p-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">📡 {b.band}</h3>
              <span className="text-sm opacity-80">{b.trend}</span>
            </div>

            <p className="mt-1 text-sm">
              <span className="font-semibold">{b.dxNow}% DX</span>
              <span className="opacity-70 ml-2">
                SNR {b.snr?.toFixed(1)} dB · Abs {b.absorption?.toFixed(1)} dB
              </span>
            </p>

            <div className="mt-1 text-xs opacity-70 leading-tight">
              <p>Deterministic: {pct(b.dxDeterministic)}%</p>
              <p>WSPR: {pct(b.dxWspr)}%</p>
              <p>FT8: {pct(b.dxFt8)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}