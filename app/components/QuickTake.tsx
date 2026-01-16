"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import SeverityBadge from "./SeverityBadge";

export default function QuickTake() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading || !data) return null;
  if (isError) return null;

  // Use hybrid-scored fields instead of deterministic
  const severity = data.hybridSeverity;
  const quickTake = data.hybridQuickTake;

  return (
    <div className="mb-4 text-sm">
      <SeverityBadge severity={severity} />{" "}
      <span className="text-neutral-300">{quickTake}</span>
    </div>
  );
}