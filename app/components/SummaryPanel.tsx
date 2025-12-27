"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import ReactMarkdown from "react-markdown";
import Tooltip from "./Tooltip";

export default function SummaryPanel() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading) {
    return (
      <div className="bg-neutral-900 text-white p-4 rounded-lg">
        Loading summary…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-neutral-900 text-white p-4 rounded-lg">
        Error loading summary.
      </div>
    );
  }

  // Correct variables
  const band = data.bestBand;
  const reason = data.reason;

  // Colour based on band
  const bandColor =
    band === "10m" ? "bg-green-600" :
    band === "12m" ? "bg-emerald-600" :
    band === "15m" ? "bg-blue-600" :
    band === "17m" ? "bg-indigo-600" :
    band === "20m" ? "bg-purple-600" :
    band === "30m" ? "bg-yellow-600 text-black" :
    "bg-gray-600";

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Daily HF Summary</h2>

        {/* Best Band Badge */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${bandColor}`}
        >
          Best Band: {band}
          <Tooltip text={reason} />
        </span>
      </div>

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{data.markdown}</ReactMarkdown>
      </div>
    </div>
  );
}