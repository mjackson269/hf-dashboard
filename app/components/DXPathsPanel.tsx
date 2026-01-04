"use client";

import React from "react";

// Region → band mapping
const regionBandMap: Record<string, string[]> = {
  Europe: ["40m", "30m", "20m"],
  NorthAmerica: ["20m", "17m", "15m"],
  SouthAmerica: ["20m", "15m", "10m"],
  Africa: ["20m", "17m", "15m"],
  Asia: ["20m", "15m", "10m"]
};

// Helper to clamp and normalize scores
function pct(value: number | undefined) {
  if (value === undefined || value === null) return 0;
  return Math.round(Math.min(value, 1) * 100);
}

export default function DXPathsPanel({ data }: { data: any }) {
  const forecastStep = data?.forecast24h?.[0];
  const bands = forecastStep?.bands;

  if (!bands || typeof bands !== "object") {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md">
        <p>No DX path data available</p>
      </div>
    );
  }

  const regions = Object.keys(regionBandMap);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4">DX Paths Open Now</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((region) => {
          const candidateBands = regionBandMap[region];
          let bestBand = null;
          let bestScore = 0;
          let bandData: any = null;

          for (const band of candidateBands) {
            const info = bands[band];
            if (info?.dx > bestScore) {
              bestScore = info.dx;
              bestBand = band;
              bandData = info;
            }
          }

          if (!bandData) return null;

          const isOpen = bestScore >= 0.5;

          return (
            <div
              key={region}
              className="bg-gray-900 text-white p-4 rounded-lg shadow-md"
            >
              <h3 className="text-lg font-semibold">🌍 {region}</h3>

              <p className="mt-1">{isOpen ? "🟢 Open" : "🔴 Closed"}</p>

              <p className="mt-1">
                🚀 Best Band: {bestBand} ({pct(bestScore)}% DX)
              </p>

              <p className="mt-1">
                SNR {bandData.snr?.toFixed(1)} dB · Absorption{" "}
                {bandData.absorption?.toFixed(1)} dB
              </p>

              <div className="mt-2 text-xs opacity-80">
                <p>Deterministic: {pct(bandData.dxDeterministic)}%</p>
                <p>WSPR: {pct(bandData.dxWspr)}%</p>
                <p>FT8: {pct(bandData.dxFt8)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}