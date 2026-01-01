"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

export default function BestBandNow() {
  const { data, isLoading } = useSummaryData();
  const bands = data?.current?.bands;

  if (isLoading || !bands) {
    return <div className={card}>Calculating best band…</div>;
  }

  const best = Object.entries(bands)
    .sort((a, b) => b[1].dx - a[1].dx)[0];

  const bestBand = best?.[0];
  const bestData = best?.[1];

  // Generate a short operator-grade summary
  function getBandSummary(band: string, data: any) {
    if (!data) return "";

    const { snr, absorption, dx } = data;

    const reasons = [];
    if (snr >= 20) reasons.push("high SNR");
    if (absorption <= 1) reasons.push("low absorption");
    if (dx >= 70) reasons.push("strong DX probability");

    const reasonText =
      reasons.length > 0 ? reasons.join(" and ") : "favourable conditions";

    return `${band} is performing best right now due to ${reasonText}.`;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>Best Band Right Now</h2>

      <div className="mt-3 text-lg font-bold text-emerald-400">
        {best ? `${bestBand} (${bestData.dx}%)` : "No data"}
      </div>

      {best && (
        <div className="mt-2 text-sm text-slate-400">
          {getBandSummary(bestBand, bestData)}
        </div>
      )}
    </div>
  );
}