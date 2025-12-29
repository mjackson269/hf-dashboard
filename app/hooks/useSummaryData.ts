"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSummaryData() {
  const { data, error, isLoading } = useSWR("/api/ai-summary", fetcher);
  const { data: current } = useSWR("/api/current", fetcher);

  // If either endpoint hasn't returned yet
  if (!data || !current) {
    return {
      data: null,
      isLoading: isLoading || !current,
      isError: error,
    };
  }

  return {
    data: {
      // AI summary fields
      markdown: data.markdown,
      bestBand: data.bestBand,
      reason: data.reason,
      quickTake: data.quickTake,
      severity: data.severity,
      score: data.score,

      // Current global values
      sfiEstimated: current.sfiEstimated,
      sfiAdjusted: current.sfiAdjusted,
      kp: current.kp,
      muf: current.muf,

      // Trend values
      sfiEstimatedPrev: current.sfiEstimatedPrev,
      sfiAdjustedPrev: current.sfiAdjustedPrev,
      kpPrev: current.kpPrev,
      mufPrev: current.mufPrev,

      // ⭐ NEW — Per‑band MUF + SNR support
      bands: current.bands,
    },
    isLoading,
    isError: error,
  };
}