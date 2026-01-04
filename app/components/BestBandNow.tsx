"use client";

import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function BestBandNow() {
  const { data, isLoading } = useSummaryData();

  if (isLoading) return <div className={card}>Evaluating best band…</div>;
  if (!data || !data.bands) return <div className={card}>No band data.</div>;

  const entries = Object.entries(data.bands) as [string, any][];
  const best = entries.sort((a, b) => b[1].dx - a[1].dx)[0];

  if (!best) return <div className={card}>No band data.</div>;

  const [band, vals] = best;
  const reasons: string[] = [];

  if (vals.dx >= 70) reasons.push("strong DX probability");
  else if (vals.dx >= 40) reasons.push("moderate DX probability");
  else reasons.push("limited DX probability");

  if (vals.snr >= 30) reasons.push("high SNR");
  else if (vals.snr >= 20) reasons.push("usable SNR");
  else reasons.push("weak SNR");

  if (vals.absorption <= 2) reasons.push("low absorption");
  else if (vals.absorption <= 4) reasons.push("moderate absorption");
  else reasons.push("high absorption");

  return (
    <div className={card}>
      <h2 className={panelTitle}>Best Band Now</h2>
      <p className="mt-2 text-lg font-semibold text-white">
        {band} — {vals.dx}% DX probability
      </p>
      <p className="mt-1 text-neutral-300">
        SNR {vals.snr} dB · Absorption {vals.absorption} dB
      </p>
      <p className="mt-2 text-neutral-300">
        {reasons.join(", ")}.
      </p>
    </div>
  );
}