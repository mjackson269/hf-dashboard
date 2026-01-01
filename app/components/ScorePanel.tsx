"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

export default function PropagationScorePanel() {
  const { data, isLoading } = useSummaryData();
  const score = data?.score;

  return (
    <div className={card}>
      <h2 className={panelTitle}>Propagation Score</h2>
      <div className="mt-3 text-lg font-bold text-slate-200">
        {isLoading ? "Loading…" : score !== undefined ? `${score} / 100` : "Score data is not available."}
      </div>
    </div>
  );
}