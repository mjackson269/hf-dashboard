"use client";

import React from "react";
import { useSummaryData } from "../hooks/useSummaryData";

export default function CurrentPanel() {
  const { data, isLoading } = useSummaryData();

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300">
        Loading current conditions…
      </div>
    );
  }

  const currentBands = data?.forecast24h?.[0]?.bands;
  const previousBands = data?.forecast24h?.[1]?.bands;

  if (!currentBands) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300">
        No band data available.
      </div>
    );
  }

  const entries = Object.entries(currentBands).map(([band, stats]: any) => {
    const dxNow = Math.round(stats.dx ?? 0);
    const dxPrev = Math.round(previousBands?.[band]?.dx ?? dxNow);
    const delta = dxNow - dxPrev;

    let trend = "➖";
    if (delta > 3) trend = "📈";
    else if (delta < -3) trend = "📉";

    return { band, dxNow, dxPrev, delta, trend, ...stats };
  });

  const best = entries.sort((a, b) => b.dxNow - a.dxNow)[0];

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300">
      <h2 className="text-lg font-semibold text-white mb-2">
        Current HF Conditions
      </h2>

      <p className="mb-3 text-sm">
        <strong className="text-white">MUF:</strong>{" "}
        {data.snapshot.muf.toFixed(1)} MHz ·{" "}
        <strong className="text-white">Solar Flux:</strong> {data.snapshot.sf} ·{" "}
        <strong className="text-white">Kp:</strong> {data.snapshot.kp}
      </p>

      <div className="mb-3 p-3 rounded-md bg-neutral-900 border border-neutral-800">
        <div className="flex justify-between items-center">
          <strong className="text-white text-base">
            Best band now: {best.band}
          </strong>
          <span className="text-sm opacity-80">{best.trend}</span>
        </div>

        <p className="text-sm mt-1">
          {best.dxNow}% DX · SNR {best.snr?.toFixed(1)} dB · Abs{" "}
          {best.absorption?.toFixed(1)} dB
        </p>

        <p className="text-xs opacity-70 mt-1 leading-tight">
          Det {Math.round(best.dxDeterministic)}% · WSPR{" "}
          {Math.round(best.dxWspr)}% · FT8 {Math.round(best.dxFt8)}%
        </p>
      </div>

      <div className="text-xs text-neutral-400">
        <strong className="text-neutral-200">Band breakdown:</strong>
        <ul className="mt-2 space-y-1">
          {entries.map((b) => (
            <li key={b.band}>
              <span className="text-neutral-300 font-medium">
                {b.band} {b.trend}
              </span>
              <div className="ml-2">
                {b.dxNow}% DX · SNR {b.snr?.toFixed(1)} dB · Abs{" "}
                {b.absorption?.toFixed(1)} dB
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}