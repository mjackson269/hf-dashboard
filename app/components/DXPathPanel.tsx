"use client";

console.log("FORECAST STEP 0:", data?.forecast24h?.[0]);

import React from "react";

// Mapping regions to representative bands (simplified MUF logic)
const regionBandMap: Record<string, string[]> = {
  Europe: ["40m", "30m", "20m"],
  NorthAmerica: ["20m", "17m", "15m"],
  SouthAmerica: ["20m", "15m", "10m"],
  Africa: ["20m", "17m", "15m"],
  Asia: ["20m", "15m", "10m"]
};

export default function DXPathsPanel({ data }: { data: any }) {
  const bands = data?.forecast24h?.[0]?.bands;
  if (!bands) return null;

  const regions = Object.keys(regionBandMap);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4">DX Paths Open Now</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((region) => {
          const candidateBands = regionBandMap[region];
          let bestBand = null;
          let bestScore = 0;
          let bandData = null;

          for (const band of candidateBands) {
            const data = bands[band];
            if (data?.dx > bestScore) {
              bestScore = data.dx;
              bestBand = band;
              bandData = data;
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

              <p className="mt-1">
                {isOpen ? "🟢 Open" : "🔴 Closed"}
              </p>

              <p className="mt-1">
                🚀 Best Band: {bestBand} ({Math.round(bestScore * 100)}% DX)
              </p>

              <p className="mt-1">
                SNR {bandData.snr?.toFixed(1)} dB · Absorption {bandData.absorption?.toFixed(1)} dB
              </p>

              <div className="mt-2 text-xs opacity-80">
                <p>Deterministic: {Math.round(bandData.dxDeterministic * 100)}%</p>
                <p>WSPR: {Math.round(bandData.dxWspr * 100)}%</p>
                <p>FT8: {Math.round(bandData.dxFt8 * 100)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}