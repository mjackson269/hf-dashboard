"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

export default function PropagationScore() {
  const { data, isLoading } = useSummaryData();

  if (isLoading || !data?.score || !data?.current) {
    return <div className={card}>Calculating propagation score…</div>;
  }

  const score = data.score;
  const current = data.current;

  // Determine colour severity
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 60) return "text-yellow-400";
    if (value >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const scoreColor = getScoreColor(score);

  // Generate a one-sentence summary
  const getSummary = () => {
    const { sfi, kp_est, muf } = current;

    if (score >= 80) {
      return "Excellent conditions driven by high MUF and quiet geomagnetic activity.";
    }
    if (score >= 60) {
      return "Good overall conditions with stable MUF and manageable geomagnetic activity.";
    }
    if (score >= 40) {
      return "Mixed conditions — MUF or SFI may be limiting higher-band performance.";
    }
    return "Poor propagation due to low MUF or elevated geomagnetic disturbance.";
  };

  // Factor breakdown (simple interpretation of your scoring logic)
  const getFactorBreakdown = () => {
    const { sfi, kp_est, muf } = current;

    const sfiImpact = sfi >= 100 ? "boosting" : "neutral";
    const kpImpact = kp_est >= 3 ? "degrading" : "stable";
    const mufImpact = muf >= 14 ? "supporting" : muf >= 10 ? "moderate" : "limiting";

    return [
      { label: "SFI", value: sfi, effect: sfiImpact },
      { label: "Kp", value: kp_est?.toFixed(1), effect: kpImpact },
      { label: "MUF", value: `${muf} MHz`, effect: mufImpact },
    ];
  };

  const breakdown = getFactorBreakdown();

  return (
    <div className={card}>
      <h2 className={panelTitle}>Propagation Score</h2>

      {/* Score */}
      <div className={`mt-3 text-4xl font-bold ${scoreColor}`}>
        {score}
      </div>

      {/* Summary */}
      <div className="mt-2 text-sm text-slate-300">
        {getSummary()}
      </div>

      {/* Breakdown */}
      <div className="mt-4 text-sm text-slate-400 space-y-1">
        {breakdown.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span>{item.label}:</span>
            <span className="text-slate-300">
              {item.value} — {item.effect}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}