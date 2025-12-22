"use client";

import { useAISummaryData } from "../hooks/useAISummaryData";

export default function AISummaryPanel() {
  const { data, isLoading, isError } = useAISummaryData();

  if (isLoading) {
    return (
      <div className="bg-neutral-900 text-white p-4 rounded-lg">
        Generating AI summary…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-neutral-900 text-white p-4 rounded-lg">
        Error generating AI summary.
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">AI‑Generated Summary</h2>
      <p className="leading-relaxed whitespace-pre-line">{data}</p>
    </div>
  );
}