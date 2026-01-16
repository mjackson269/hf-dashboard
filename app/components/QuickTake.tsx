"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import SeverityBadge from "./SeverityBadge";

export default function QuickTake() {
  const { data, isLoading } = useSummaryData();

  if (isLoading || !data) return null;

  const severity = data.hybridSeverity ?? null;
  const quickTake = data.hybridQuickTake ?? null;

  if (!severity || !quickTake) {
    return (
      <div className="mb-4 text-sm text-neutral-500">
        No summary available.
      </div>
    );
  }

  return (
    <div className="mb-4 text-sm">
      <SeverityBadge severity={severity} />{" "}
      <span className="text-neutral-300">{quickTake}</span>
    </div>
  );
}