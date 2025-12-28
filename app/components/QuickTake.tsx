"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import SeverityBadge from "./SeverityBadge";

export default function QuickTake() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading || !data) return null;
  if (isError) return null;

  console.log("Severity from API:", data.severity);

  return (
    <div className="mb-4 text-sm">
      <SeverityBadge severity={data.severity} />
      {" "}
      <span className="text-neutral-300">{data.quickTake}</span>
    </div>
  );
}