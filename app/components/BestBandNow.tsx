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

  return (
    <div className={card}>
      <h2 className={panelTitle}>Best Band Right Now</h2>

      <div className="mt-3 text-lg font-bold text-emerald-400">
        {best ? `${best[0]} (${best[1].dx}%)` : "No data"}
      </div>
    </div>
  );
}