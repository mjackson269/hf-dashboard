"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import Tooltip from "./Tooltip";
import { card, badge } from "../lib/designSystem";
import TrendIndicator from "./TrendIndicator";

export default function StatusBar() {
  const { data, isLoading } = useSummaryData();

  if (isLoading || !data?.current) {
    return <div className={`${card} mb-4`}>Loading status…</div>;
  }

  const current = data.current;

  // Compute best band from live band data
  const bands = current.bands ?? {};
  const best = Object.entries(bands)
    .sort((a, b) => b[1].dx - a[1].dx)[0];

  const bestBand = best?.[0] ?? "—";
  const reason = best ? `DX probability ${best[1].dx}%` : "No band data";

  const bandColor =
    bestBand === "10m" ? "bg-green-600" :
    bestBand === "12m" ? "bg-emerald-600" :
    bestBand === "15m" ? "bg-blue-600" :
    bestBand === "17m" ? "bg-indigo-600" :
    bestBand === "20m" ? "bg-purple-600" :
    bestBand === "30m" ? "bg-yellow-500 text-black" :
    "bg-gray-600";

  return (
    <div className={`${card} mb-6 flex flex-wrap gap-6 items-center text-sm`}>

      <div className="flex items-center gap-2">
        <strong>SFI:</strong> {current.sfi ?? "—"}
        <TrendIndicator current={current.sfi} previous={null} />
        <Tooltip text="Solar Flux Index from NOAA." />
      </div>

      <div className="flex items-center gap-2">
        <strong>Kp:</strong> {current.kp ?? "—"}
        <TrendIndicator current={current.kp} previous={null} />
        <Tooltip text="Geomagnetic disturbance index." />
      </div>

      <div className="flex items-center gap-2">
        <strong>MUF:</strong> {current.muf ? `${current.muf} MHz` : "—"}
        <TrendIndicator current={current.muf} previous={null} />
        <Tooltip text="Maximum usable frequency." />
      </div>

      <div className={`${badge} ${bandColor}`}>
        Best Band: {bestBand}
        <Tooltip text={reason} />
      </div>

    </div>
  );
}