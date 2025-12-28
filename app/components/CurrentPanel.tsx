"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import Tooltip from "./Tooltip";
import { card, panelTitle, subtleText } from "../styles/designSystem";

export default function CurrentPanel() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading) {
    return <div className={card}>Loading current conditions…</div>;
  }

  if (isError || !data) {
    return <div className={card}>Error loading current conditions.</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>Current HF Conditions</h2>

      <div className="space-y-3 text-sm">

        {/* SFI Estimated */}
        <div className="flex items-center gap-2">
          <strong>SFI (Est):</strong> {data.sfiEstimated}
          <Tooltip text="Estimated SFI updates every 3 hours from NOAA’s Geophysical Alert Message. Best for real‑time HF propagation." />
        </div>

        {/* SFI Adjusted */}
        <div className="flex items-center gap-2">
          <strong>SFI (Adj):</strong> {data.sfiAdjusted}
          <Tooltip text="Adjusted SFI is the daily corrected flux from Penticton (Canada), published by NOAA." />
        </div>

        {/* Kp Index */}
        <div className="flex items-center gap-2">
          <strong>Kp Index:</strong> {data.kp}
          <Tooltip text="Kp measures geomagnetic disturbance. Higher values degrade HF propagation, especially on higher bands." />
        </div>

        {/* MUF */}
        <div className="flex items-center gap-2">
          <strong>MUF:</strong> {data.muf} MHz
          <Tooltip text="MUF determines which HF bands are open. Higher MUF supports higher‑frequency bands like 15m, 12m, and 10m." />
        </div>

        {/* Timestamp (optional, but looks clean) */}
        <div className={subtleText}>
          Updated just now
        </div>

      </div>
    </div>
  );
}