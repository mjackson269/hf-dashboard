"use client";

import { useState, useMemo } from "react";
import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

const BANDS = ["80m", "40m", "20m", "15m", "10m"] as const;

export default function ForecastPanelV2() {
  const { data, isLoading } = useSummaryData();

  // Hooks must run unconditionally
  const [advanced, setAdvanced] = useState(false);
  const forecast = data?.forecast24h ?? [];

  const bestDX = useMemo(() => {
    if (!forecast.length) return null;

    let best = { step: null as any, band: "", score: -1 };

    forecast.forEach((step: any) => {
      BANDS.forEach((band) => {
        const b = step.bands?.[band];
        if (!b) return;
        if (b.dx > best.score) {
          best = { step, band, score: b.dx };
        }
      });
    });

    return best.step ? best : null;
  }, [forecast]);

  // Conditional rendering AFTER hooks
  if (isLoading) return <div className={card}>Loading 24h forecast…</div>;
  if (!forecast.length) return <div className={card}>No forecast data.</div>;

  return (
    <div className={card}>
      <h2 className={panelTitle}>24h MUF & DX Forecast</h2>

      {/* Toggle */}
      <div className="mt-2 flex gap-2 text-sm">
        <button
          onClick={() => setAdvanced(false)}
          className={`px-2 py-1 rounded ${
            !advanced ? "bg-neutral-700 text-white" : "bg-neutral-900 text-neutral-400"
          }`}
        >
          Simple
        </button>
        <button
          onClick={() => setAdvanced(true)}
          className={`px-2 py-1 rounded ${
            advanced ? "bg-neutral-700 text-white" : "bg-neutral-900 text-neutral-400"
          }`}
        >
          Advanced
        </button>
      </div>

      {/* Best DX Window */}
      {bestDX && (
        <div className="mt-3 text-neutral-200">
          <strong>📡 Best DX Window:</strong> {bestDX.step.timeLabel} UTC on{" "}
          {bestDX.band} ({bestDX.score}% DX).
        </div>
      )}

      {/* SIMPLE VIEW — RESTORED GRID */}
      {!advanced && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-neutral-300">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="py-1 text-left">Time</th>
                <th className="py-1 text-left">MUF</th>
                {BANDS.map((band) => (
                  <th key={band} className="py-1 text-left">
                    {band}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecast.map((step: any, idx: number) => (
                <tr key={idx} className="border-b border-neutral-900">
                  <td className="py-1">{step.timeLabel}</td>
                  <td className="py-1">{step.muf.toFixed(1)} MHz</td>

                  {BANDS.map((band) => {
                    const b = step.bands?.[band];
                    if (!b) return <td key={band}>–</td>;

                    const dx = b.dx;
                    const dxBarWidth = `${dx}%`;
                    const dxBarColor =
                      dx >= 70
                        ? "bg-emerald-500"
                        : dx >= 40
                        ? "bg-amber-500"
                        : dx >= 20
                        ? "bg-red-500"
                        : "bg-neutral-700";

                    return (
                      <td key={band} className="py-1 w-24">
                        <div className="h-2 bg-neutral-800 rounded">
                          <div
                            className={`h-full ${dxBarColor}`}
                            style={{ width: dxBarWidth }}
                          />
                        </div>
                        <div className="text-neutral-400 mt-1">{dx}%</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADVANCED VIEW — FULL DETAILS */}
      {advanced && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-neutral-300">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="py-1 text-left">Time</th>
                <th className="py-1 text-left">MUF</th>
                {BANDS.map((band) => (
                  <th key={band} className="py-1 text-left">
                    {band}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecast.map((step: any, idx: number) => (
                <tr key={idx} className="border-b border-neutral-900">
                  <td className="py-1">{step.timeLabel}</td>
                  <td className="py-1">{step.muf.toFixed(1)} MHz</td>

                  {BANDS.map((band) => {
                    const b = step.bands?.[band];
                    if (!b) return <td key={band}>–</td>;

                    return (
                      <td key={band} className="py-1">
                        DX {b.dx}% · SNR {b.snr} dB · Abs {b.absorption} dB
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}