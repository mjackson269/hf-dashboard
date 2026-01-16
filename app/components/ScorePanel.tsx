"use client";

import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function PropagationScore() {
  const { data, isLoading } = useSummaryData();

  if (isLoading) return <div className={card}>Scoring propagation…</div>;
  if (!data || !data.bands) return <div className={card}>No propagation data.</div>;

  const bands = Object.values(data.bands) as any[];

  const avgDx =
    bands.reduce((sum, b) => sum + (b.dx ?? 0), 0) / (bands.length || 1);

  const score = Math.round(avgDx);

  let label = "Poor";
  if (score >= 70) label = "Excellent";
  else if (score >= 50) label = "Good";
  else if (score >= 30) label = "Fair";

  return (
    <div className={card}>
      <h2 className={panelTitle}>HF Outlook Score</h2>
      <p className="mt-2 text-3xl font-bold text-white">{score}/100</p>
      <p className="mt-1 text-neutral-300">{label} HF DX conditions overall.</p>
    </div>
  );
}