"use client";

import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function ForecastPanel() {
  const { data, isLoading } = useSummaryData();

  if (isLoading || !data?.forecast24h) {
    return <div className={card}>Loading forecast…</div>;
  }

  const forecast = data.forecast24h;

  const now = new Date();
  const formatted = now.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-2">
        <h2 className={panelTitle}>24h Propagation Forecast</h2>
        <span className="text-xs text-neutral-400">Updated: {formatted}</span>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="text-neutral-400">
          <tr>
            <th className="text-left py-1">Time</th>
            <th className="text-left py-1">SFI</th>
            <th className="text-left py-1">Kp</th>
            <th className="text-left py-1">MUF (MHz)</th>
          </tr>
        </thead>

        <tbody>
          {forecast.map((row, i) => (
            <tr key={i} className="border-t border-neutral-800">
              <td className="py-1">{row.time}</td>
              <td className="py-1">{row.sfi}</td>
              <td className="py-1">{row.kp}</td>
              <td className="py-1">{row.muf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}