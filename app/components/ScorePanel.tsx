"use client";

import { card, panelTitle, subtleText } from "../styles/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function ScorePanel() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading) {
    return (
      <div className={card}>
        <h2 className={panelTitle}>Propagation Score</h2>
        <p className={subtleText}>Loading score…</p>
      </div>
    );
  }

  if (isError || !data?.score) {
    return (
      <div className={card}>
        <h2 className={panelTitle}>Propagation Score</h2>
        <p className={subtleText}>Score data is not available.</p>
      </div>
    );
  }

  const score = data.score;

  // Colour logic
  const scoreColor =
    score >= 70
      ? "text-green-400"
      : score >= 40
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className={card}>
      <h2 className={panelTitle}>Propagation Score</h2>

      <div className="flex items-center gap-4 mt-2">
        <span className={`text-5xl font-bold ${scoreColor}`}>{score}</span>

        <div className="flex flex-col">
          <span className={subtleText}>
            Based on MUF, SFI, and Kp trends
          </span>
          <span className="text-neutral-300 text-sm">
            {score >= 70
              ? "Excellent conditions"
              : score >= 40
              ? "Moderate conditions"
              : "Poor conditions"}
          </span>
        </div>
      </div>
    </div>
  );
}