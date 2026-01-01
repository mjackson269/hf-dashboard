"use client";

import { useState, useMemo } from "react";
import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

const bands = ["80m", "40m", "20m", "15m", "10m"] as const;
type BandKey = (typeof bands)[number];

const BAND_FREQ: Record<BandKey, number> = {
  "80m": 3.6,
  "40m": 7.1,
  "20m": 14.1,
  "15m": 21.1,
  "10m": 28.5,
};

function classifyMufSupport(muf: number, band: BandKey) {
  const ratio = muf / BAND_FREQ[band];
  if (ratio < 0.8) return "Closed";
  if (ratio < 1.1) return "Marginal";
  return "Open";
}

function getShadingClassFromTimeLabel(timeLabel?: string): string {
  if (!timeLabel || typeof timeLabel !== "string") return "";
  const hour = Number(timeLabel.substring(0, 2));
  if (Number.isNaN(hour)) return "";

  if (hour >= 7 && hour < 18) return "";
  if ((hour >= 5 && hour < 7) || (hour >= 18 && hour < 20)) {
    return "bg-neutral-900/20";
  }
  return "bg-neutral-900/40";
}

export default function ForecastPanelV2() {
  const { data, isLoading } = useSummaryData();
  const [mode, setMode] = useState<"basic" | "advanced">("basic");

  const raw = Array.isArray(data?.forecast24h) ? data.forecast24h : [];

  // FIX: forecast now uses the new API shape
  const forecast = raw.map((step, i) => ({
    timeLabel: step.timeLabel ?? `${String(i).padStart(2, "0")}:00`,
    bands: step.bands ?? {
      "80m": { snr: 20, absorption: 1, dx: 0 },
      "40m": { snr: 20, absorption: 1, dx: 0 },
      "20m": { snr: 20, absorption: 1, dx: 0 },
      "15m": { snr: 20, absorption: 1, dx: 0 },
      "10m": { snr: 20, absorption: 1, dx: 0 },
    },
    muf: step.muf ?? data?.current?.muf ?? 12,
  }));

  // Best DX window
  const bestDX = useMemo(() => {
    if (!forecast.length) return null;

    let best = { step: null as any, band: "", dx: -1 };

    forecast.forEach((step: any) => {
      for (const band of bands) {
        const dx = step.bands?.[band]?.dx ?? 0;
        if (dx > best.dx) {
          best = { step, band, dx };
        }
      }
    });

    return best;
  }, [forecast]);

  // Best band per time block
  const bestBandPerStep = useMemo(() => {
    if (!forecast.length) return [];

    return forecast.map((step: any) => {
      const entries = Object.entries(step.bands || {}) as [
        BandKey,
        { dx: number }
      ][];
      const sorted = entries.sort((a, b) => b[1].dx - a[1].dx);
      return sorted[0]?.[0] || null;
    });
  }, [forecast]);

  // Hydration-safe timestamp
  const formatted = data?.timestamp
    ? new Date(data.timestamp).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (isLoading || !forecast.length) {
    return <div className={card}>Loading forecast…</div>;
  }

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={panelTitle}>24h Propagation Forecast</h2>

        <button
          onClick={() => setMode(mode === "basic" ? "advanced" : "basic")}
          className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition"
        >
          {mode === "basic" ? "Advanced View" : "Basic View"}
        </button>
      </div>

      <div className="mb-3 text-xs text-neutral-300">
        {bestDX && bestDX.step && (
          <>
            <div>
              <strong>📡 Best DX Window:</strong> {bestDX.step.timeLabel} UTC
            </div>
            <div>
              <strong>⭐ Best Band:</strong> {bestDX.band} ({bestDX.dx}%)
            </div>
          </>
        )}
        <div className="text-neutral-500 mt-1">Updated: {formatted}</div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {forecast.map((step: any, i: number) => (
          <div
            key={i}
            className={`p-3 rounded bg-neutral-900 ${getShadingClassFromTimeLabel(
              step.timeLabel
            )}`}
          >
            <div className="text-sm font-semibold mb-2">
              {step.timeLabel} UTC{" "}
              {bestBandPerStep[i] && (
                <span className="text-xs text-emerald-400 ml-2">
                  ⭐ {bestBandPerStep[i]}
                </span>
              )}
            </div>

            {bands.map((band) => {
              const bandData = step.bands[band];

              if (mode === "basic") {
                const support = classifyMufSupport(step.muf, band);
                return (
                  <div key={band} className="flex justify-between text-xs py-1">
                    <span className="text-neutral-300">{band}</span>
                    <span
                      className={
                        support === "Open"
                          ? "text-emerald-400"
                          : support === "Marginal"
                          ? "text-yellow-300"
                          : "text-red-400"
                      }
                    >
                      {support}
                    </span>
                  </div>
                );
              }

              return (
                <div key={band} className="flex justify-between text-xs py-1">
                  <span className="text-neutral-300">{band}</span>
                  <span className="text-neutral-400">
                    DX {bandData.dx}% | SNR {bandData.snr} dB
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[0.75rem] border-collapse">
          <thead className="text-neutral-400">
            <tr>
              <th className="text-left py-1 pr-2">Band</th>
              {forecast.map((step: any, i: number) => (
                <th
                  key={i}
                  className={`text-center px-2 py-1 whitespace-nowrap ${getShadingClassFromTimeLabel(
                    step.timeLabel
                  )}`}
                >
                  <div>{step.timeLabel}</div>
                  {bestBandPerStep[i] && (
                    <div className="text-[0.65rem] text-emerald-400">
                      ⭐ {bestBandPerStep[i]}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {bands.map((band) => (
              <tr key={band} className="border-t border-neutral-800">
                <td className="py-1 pr-2 font-medium text-slate-300">{band}</td>

                {forecast.map((step: any, i: number) => {
                  const shading = getShadingClassFromTimeLabel(step.timeLabel);
                  const bandData = step.bands[band];

                  if (mode === "basic") {
                    const support = classifyMufSupport(step.muf, band);

                    return (
                      <td
                        key={i}
                        className={`px-2 py-1 text-center ${shading}`}
                      >
                        <span
                          className={
                            support === "Open"
                              ? "text-emerald-400"
                              : support === "Marginal"
                              ? "text-yellow-300"
                              : "text-red-400"
                          }
                        >
                          {support}
                        </span>
                      </td>
                    );
                  }

                  const snr = bandData.snr;
                  const dx = bandData.dx;
                  const absorption = bandData.absorption;

                  const snrColor =
                    snr >= 30
                      ? "text-emerald-400"
                      : snr >= 20
                      ? "text-cyan-300"
                      : snr >= 10
                      ? "text-yellow-300"
                      : "text-red-400";

                  const dxBarWidth = `${dx}%`;
                  const dxBarColor =
                    dx >= 70
                      ? "bg-emerald-500"
                      : dx >= 40
                      ? "bg-cyan-500"
                      : dx >= 20
                      ? "bg-yellow-500"
                      : "bg-red-500";

                  return (
                    <td
                      key={i}
                      className={`px-2 py-1 text-center ${shading}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`font-semibold ${snrColor}`}>
                          {snr} dB
                        </span>
                        <span className="text-[0.65rem] text-slate-400">
                          Abs: {absorption} dB
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${dxBarColor}`}
                            style={{ width: dxBarWidth }}
                          />
                        </div>
                        <span className="text-[0.65rem] text-slate-400">
                          {dx}%
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}