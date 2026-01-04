"use client";

import { useSummaryData } from "../hooks/useSummaryData";

export default function StatusBar() {
  const { data, isLoading } = useSummaryData();

  if (isLoading)
    return (
      <div className="w-full text-xs text-neutral-400 py-1 px-3 border-t border-neutral-800">
        Loading status…
      </div>
    );

  if (!data || !data.bands)
    return (
      <div className="w-full text-xs text-neutral-400 py-1 px-3 border-t border-neutral-800">
        No band data.
      </div>
    );

  const entries = Object.entries(data.bands) as [string, any][];
  const best = entries.sort((a, b) => b[1].dx - a[1].dx)[0];

  const text = best
    ? `Best band: ${best[0]} — DX probability ${best[1].dx}%`
    : "No band data";

  return (
    <div className="w-full text-xs text-neutral-400 py-1 px-3 border-t border-neutral-800">
      {text}
    </div>
  );
}