"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSummaryData() {
  const { data: ai, error, isLoading } = useSWR("/api/ai-summary", fetcher);
  const { data: current } = useSWR("/api/current", fetcher);
  const { data: commentary } = useSWR("/api/commentary", fetcher);
  const { data: forecast } = useSWR("/api/forecast", fetcher);

  // If any required endpoint hasn't returned yet
  if (!ai || !current || !commentary || !forecast) {
    return {
      data: null,
      isLoading: isLoading || !current || !commentary || !forecast,
      isError: error,
    };
  }

  return {
    data: {
      // AI summary fields
      markdown: ai.markdown,
      bestBand: ai.bestBand,
      reason: ai.reason,
      quickTake: ai.quickTake,
      severity: ai.severity,
      score: ai.score,

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

      // Per‑band MUF + SNR support
      bands: current.bands,

      // Live snapshot (0–10 scale)
      snapshot: commentary.snapshot,

      // ⭐ NEW — 24h forecast from /api/forecast
      forecast24h: forecast.forecast,
    },
    isLoading,
    isError: error,
  };
}