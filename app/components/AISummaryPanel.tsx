"use client";

import { useAISummaryData } from "../hooks/useAISummaryData";
import ReactMarkdown from "react-markdown";

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

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{data.markdown}</ReactMarkdown>
      </div>
    </div>
  );
}