"use client";

import { useEffect, useState } from "react";
import { useSummaryData } from "../hooks/useSummaryData";

export default function QuickReadPanel({ onClose }: { onClose: () => void }) {
  const [hydrated, setHydrated] = useState(false);
  const { data, isLoading } = useSummaryData();

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Prevent server/client mismatch
  if (!hydrated || isLoading || !data?.snapshot) {
    return (
      <div className="p-6 text-slate-300">
        Loading live intelligence…
      </div>
    );
  }

  return (
    <div className="p-6 text-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-cyan-200">Quick Read</h2>
        <button
          onClick={onClose}
          className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
        >
          Close
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-cyan-300">AI Operator Briefing</h3>
        <p className="text-sm text-slate-300 whitespace-pre-line">
          {data.intel ?? "No AI intelligence available."}
        </p>
      </div>
    </div>
  );
}