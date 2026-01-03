"use client";

import { useMemo } from "react";
import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

// Friendly region labels + approximate great-circle distances from UK
const REGIONS = [
  { name: "Europe", icon: "🌍", distance: 1500 },
  { name: "North America", icon: "🌎", distance: 6000 },
  { name: "South America", icon: "🌎", distance: 9500 },
  { name: "Africa", icon: "🌍", distance: 5000 },
  { name: "Asia", icon: "🌏", distance: 7000 },
  { name: "Oceania", icon: "🌏", distance: 16000 },
] as const;

// Conservative maximum usable distances (km)
const MAX_DISTANCE = {
  "80m": 1500,
  "40m": 6000,
  "20m": 10000,
  "15m": 8000,
  "10m": 5000,
} as const;

const BANDS = {
  "80m": 3.5,
  "40m": 7,
  "20m": 14,
  "15m": 21,
  "10m": 28,
} as const;

export default function DXPathsPanel() {
  const { data, isLoading } = useSummaryData();

  const bands = data?.bands ?? {};
  const muf = data?.muf ?? 0;

  const results = useMemo(() => {
    if (!bands || !muf) return [];

    return REGIONS.map((region) => {
      const distance = region.distance;
      const hops = Math.max(1, distance / 4000);

      let bestBand = null as null | {
        band: string;
        dx: number;
        snr: number;
        absorption: number;
      };

      Object.entries(bands).forEach(([band, stats]: any) => {
        const freq = BANDS[band as keyof typeof BANDS];
        if (!freq) return;

        // Conservative maximum usable distance check
        if (distance > MAX_DISTANCE[band as keyof typeof MAX_DISTANCE]) return;

        // Hop-based MUF requirement
        const requiredMuf = freq * (1 + 0.15 * (hops - 1));
        if (muf < requiredMuf) return;

        // Conservative thresholds
        const viable =
          stats.dx >= 40 &&
          stats.snr >= 15 &&
          stats.absorption <= 6;

        if (!viable) return;

        if (!bestBand || stats.dx > bestBand.dx) {
          bestBand = {
            band,
            dx: stats.dx,
            snr: stats.snr,
            absorption: stats.absorption,
          };
        }
      });

      const status = bestBand
        ? bestBand.dx >= 70
          ? "open"
          : bestBand.dx >= 40
          ? "marginal"
          : "closed"
        : "closed";

      return {
        region: region.name,
        icon: region.icon,
        status,
        bestBand,
      };
    });
  }, [bands, muf]);

  if (isLoading) return <div className={card}>Evaluating DX paths…</div>;
  if (!results.length) return <div className={card}>No DX path data.</div>;

  const badge = (status: string) => {
    if (status === "open")
      return <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">🟢 Open</span>;
    if (status === "marginal")
      return <span className="px-2 py-0.5 rounded bg-amber-600 text-white">🟡 Marginal</span>;
    return <span className="px-2 py-0.5 rounded bg-red-700 text-white">🔴 Closed</span>;
  };

  const dxBar = (dx: number) => {
    const width = `${dx}%`;
    const color =
      dx >= 70
        ? "bg-emerald-500"
        : dx >= 40
        ? "bg-amber-500"
        : dx >= 20
        ? "bg-red-500"
        : "bg-neutral-700";

    return (
      <div className="mt-1 h-3 bg-neutral-800 rounded">
        <div className={`h-full ${color}`} style={{ width }} />
      </div>
    );
  };

  return (
    <div className={card}>
      <h2 className={panelTitle}>DX Paths Open Now</h2>

      <div className="mt-4 space-y-4">
        {results.map((r, idx) => (
          <div
            key={idx}
            className="border border-neutral-800 rounded p-3 bg-neutral-900/40"
          >
            {/* Region Header */}
            <div className="text-lg font-semibold text-white flex items-center gap-2">
              <span>{r.icon}</span>
              <span>{r.region}</span>
            </div>

            {/* Status */}
            <div className="mt-2 text-sm">{badge(r.status)}</div>

            {/* Best Band */}
            {r.bestBand && (
              <div className="mt-3">
                <div className="text-neutral-300">
                  <strong className="text-white">📡 Best Band:</strong>{" "}
                  {r.bestBand.band} ({r.bestBand.dx}% DX)
                </div>
                {dxBar(r.bestBand.dx)}
                <div className="text-neutral-400 text-xs mt-1">
                  SNR {r.bestBand.snr} dB · Absorption {r.bestBand.absorption} dB
                </div>
              </div>
            )}

            {!r.bestBand && (
              <div className="mt-3 text-neutral-500 text-sm">
                No viable band for this region at the moment.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}