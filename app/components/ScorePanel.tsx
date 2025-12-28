"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../styles/designSystem";

export default function ScorePanel() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading) {
    return <div className={card}>Loading propagation score…</div>;
  }

  if (isError || !data) {
    return <div className={card}>Error loading propagation score.</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>Propagation Score</h2>

      <div className="text-4xl font-bold mb-2">{data.score}</div>
      <div className="text-sm text-neutral-400">{data.scoreLabel}</div>
    </div>
  );
}