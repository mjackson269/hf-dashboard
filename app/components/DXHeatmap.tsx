"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

const bands = ["80m", "40m", "20m", "15m", "10m"] as const;
type BandKey = (typeof bands)[number];

// Classic red → yellow → green heatmap
function dxColor(dx: number): string {
  if (dx >= 80) return "bg-green-500";     // Excellent
  if (dx >= 60) return "bg-green-400";     // Very good
  if (dx >= 40) return "bg-yellow-400";    // Fair
  if (dx >= 20) return "bg-orange-500";    // Weak
  return "bg-red-600";                     // Poor
}

// Day/night shading based on UTC hour in timeLabel ("HH:MM")
function getShadingClassFromTimeLabel(timeLabel: string): string {
  const hour = Number(timeLabel.substring(0, 2));
  if (Number.isNaN(hour)) return "";

  // Daytime: 07–18 UTC
  if (hour >= 7 && hour < 18) return "";

  // Sunrise: 05–07 UTC, Sunset: 18–20 UTC
  if ((hour >= 5 && hour < 7) || (hour >= 18 && hour < 20)) {
    return "bg-neutral-900/20";
  }

  // Night
  return "bg-neutral-900/40";
}

export default function DXHeatmap() {
  const { data, isLoading } = useSummaryData();
  const forecast = data?.forecast24h ?? [];

  if (isLoading || !forecast.length) {
    return <div className={card}>Loading DX heatmap…</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>DX Heatmap</h2>

      {/* Desktop layout */}
      <div className="hidden md:block overflow-x-auto mt-3">
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
                  {step.timeLabel}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {bands.map((band) => (
              <tr key={band} className="border-t border-neutral-800">
                <td className="py-1 pr-2 font-medium text-slate-300">{band}</td>

                {forecast.map((step: any, i: number) => {
                  const dx = step.dxProbability[band] ?? 0;
                  const shading = getShadingClassFromTimeLabel(step.timeLabel);

                  return (
                    <td key={i} className={`px-1 py-1 ${shading}`}>
                      <div
                        className={`h-5 w-full rounded ${dxColor(dx)}`}
                        title={`${step.timeLabel} UTC — ${dx}% DX probability on ${band}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden space-y-4 mt-3">
        {bands.map((band) => (
          <div key={band}>
            <div className="text-xs text-neutral-300 mb-1">{band}</div>
            <div className="grid grid-cols-8 gap-1">
              {forecast.map((step: any, i: number) => {
                const dx = step.dxProbability[band] ?? 0;
                const shading = getShadingClassFromTimeLabel(step.timeLabel);

                return (
                  <div
                    key={i}
                    className={`h-4 rounded ${dxColor(dx)} ${shading}`}
                    title={`${step.timeLabel} UTC — ${dx}% DX on ${band}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}