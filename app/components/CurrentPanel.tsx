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

  // -----------------------------------------
  // Extract the current hour’s hybrid bands
  // -----------------------------------------
  const bands = data?.forecast24h?.[0]?.bands;

  if (!bands) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300">
        No band data available.
      </div>
    );
  }

  // -----------------------------------------
  // Compute best band (highest DX score)
  // -----------------------------------------
  const entries = Object.entries(bands);

  const best = entries
    .filter(([_, v]) => typeof v.dx === "number")
    .sort((a, b) => b[1].dx - a[1].dx)[0];

  // If hybrid engine hasn’t populated yet
  if (!best) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300">
        Waiting for hybrid scoring…
      </div>
    );
  }

  const [bestBand, bestStats] = best;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-neutral-300">
      <h2 className="text-lg font-semibold text-white mb-2">
        Current HF Conditions
      </h2>

      {/* MUF / SF / Kp snapshot */}
      <p className="mb-3 text-sm">
        <strong className="text-white">MUF:</strong>{" "}
        {data.snapshot.muf.toFixed(1)} MHz ·{" "}
        <strong className="text-white">Solar Flux:</strong> {data.snapshot.sf} ·{" "}
        <strong className="text-white">Kp:</strong> {data.snapshot.kp}
      </p>

      {/* Best band */}
      <p className="mt-2 text-sm">
        <strong className="text-white">Best band now:</strong> {bestBand} with{" "}
        {bestStats.dx}% DX probability (SNR {bestStats.snr} dB, absorption{" "}
        {bestStats.absorption} dB).
      </p>

      {/* Optional: show all bands */}
      <div className="mt-4 text-xs text-neutral-400">
        <strong className="text-neutral-200">Band breakdown:</strong>
        <ul className="mt-1 space-y-1">
          {entries.map(([band, stats]) => (
            <li key={band}>
              <span className="text-neutral-300">{band}:</span>{" "}
              {stats.dx}% DX · SNR {stats.snr} dB · Abs {stats.absorption} dB
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}