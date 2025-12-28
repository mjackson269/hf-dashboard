"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { panelContainer, panelTitle } from "../styles/designSystem";

export default function ScorePanel() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading || !data) return null;
  if (isError) return null;

  return (
    <div className={panelContainer}>
      <h2 className={panelTitle}>Propagation Score</h2>

      <div className="text-neutral-400 text-sm">
        Score data is not available in this version.
      </div>
    </div>
  );
}