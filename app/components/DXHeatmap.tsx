"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

export default function DXHeatmap() {
  const { data, isLoading } = useSummaryData();
  const bands = data?.current?.bands;

  if (isLoading || !bands) {
    return <div className={card}>Loading DX heatmap…</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>DX Heatmap</h2>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {Object.entries(bands).map(([band, stats]: any) => {
          const dx = stats.dx;
          const color =
            dx >= 70
              ? "bg-emerald-500"
              : dx >= 40
              ? "bg-cyan-500"
              : dx >= 20
              ? "bg-yellow-500"
              : "bg-red-500";

          return (
            <div key={band} className="flex flex-col items-start">
              <div className="text-neutral-300 font-medium">{band}</div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${color}`}
                  style={{ width: `${dx}%` }}
                />
              </div>

              <div className="text-xs text-neutral-400 mt-1">
                {dx}% DX probability
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}