"use client";

import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function DXHeatmap() {
  const { data, isLoading } = useSummaryData();

  if (isLoading) return <div className={card}>Loading DX heatmap…</div>;
  if (!data || !data.bands) return <div className={card}>No DX data.</div>;

  const entries = Object.entries(data.bands) as [string, any][];

  return (
    <div className={card}>
      <h2 className={panelTitle}>DX Heatmap</h2>
      <div className="mt-3 space-y-2">
        {entries.map(([band, stats]) => {
          const dx = stats.dx;
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
            <div key={band}>
              <div className="flex justify-between text-sm text-neutral-300">
                <span className="text-neutral-200">{band}</span>
                <span>{dx}% DX probability</span>
              </div>
              <div className="mt-1 h-2 bg-neutral-800 rounded">
                <div
                  className={`h-full ${dxBarColor}`}
                  style={{ width: dxBarWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}