"use client";

import ReactMarkdown from "react-markdown";
import { useSummaryData } from "../hooks/useSummaryData";

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

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
  };

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Daily HF Summary</h2>

      {/* Markdown wrapper */}
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{data}</ReactMarkdown>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Copy Summary to Clipboard
      </button>
    </div>
  );
}