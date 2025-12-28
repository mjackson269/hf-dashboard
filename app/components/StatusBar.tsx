"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import Tooltip from "./Tooltip";
import { card, badge } from "../styles/designSystem";
import TrendIndicator from "./TrendIndicator";


export default function StatusBar() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading || !data) {
    return <div className={`${card} mb-4`}>Loading status…</div>;
  }

  if (isError) {
    return <div className={`${card} mb-4`}>Error loading status.</div>;
  }

  const band = data.bestBand;
  const reason = data.reason;

  const bandColor =
    band === "10m" ? "bg-green-600" :
    band === "12m" ? "bg-emerald-600" :
    band === "15m" ? "bg-blue-600" :
    band === "17m" ? "bg-indigo-600" :
    band === "20m" ? "bg-purple-600" :
    band === "30m" ? "bg-yellow-500 text-black" :
    "bg-gray-600";

  return (
    <div className={`${card} mb-6 flex flex-wrap gap-6 items-center text-sm`}>

      <div className="flex items-center gap-2">
        <strong>SFI (Est):</strong> {data.sfiEstimated}
	<TrendIndicator current={data.sfiEstimated} previous={data.sfiEstimatedPrev} />
        <Tooltip text="Estimated SFI updates every 3 hours from NOAA’s Geophysical Alert Message." />
      </div>

      <div className="flex items-center gap-2">
        <strong>SFI (Adj):</strong> {data.sfiAdjusted}
	<TrendIndicator current={data.sfiAdjusted} previous={data.sfiAdjustedPrev} />
        <Tooltip text="Adjusted SFI is the daily corrected flux from Penticton (Canada)." />
      </div>

      <div className="flex items-center gap-2">
        <strong>Kp:</strong> {data.kp}
	<TrendIndicator current={data.kp} previous={data.kpPrev} />
        <Tooltip text="Kp measures geomagnetic disturbance. Higher values degrade HF propagation." />
      </div>

      <div className="flex items-center gap-2">
        <strong>MUF:</strong> {data.muf} MHz
	<TrendIndicator current={data.muf} previous={data.mufPrev} />
        <Tooltip text="MUF determines which HF bands are open." />
      </div>

      <div className={`${badge} ${bandColor}`}>
        Best Band: {band}
        <Tooltip text={reason} />
      </div>

    </div>
  );
}