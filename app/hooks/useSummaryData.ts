"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSummaryData() {
  const { data: ai, error, isLoading } = useSWR("/api/summary", fetcher);
  const { data: current } = useSWR("/api/current", fetcher);
  const { data: commentary } = useSWR("/api/commentary", fetcher);
  const { data: forecast } = useSWR("/api/forecast", fetcher);

  if (!ai || !current || !commentary || !forecast) {
    return {
      data: null,
      isLoading: isLoading || !current || !commentary || !forecast,
      isError: error,
    };
  }

  return {
    data: {
      markdown: ai.markdown,
      bestBand: ai.bestBand,
      reason: ai.reason,
      quickTake: ai.quickTake,
      severity: ai.severity,
      score: ai.score,

      sfiEstimated: current.sfiEstimated,
      sfiAdjusted: current.sfiAdjusted,
      kp: current.kp,
      muf: current.muf,

      sfiEstimatedPrev: current.sfiEstimatedPrev,
      sfiAdjustedPrev: current.sfiAdjustedPrev,
      kpPrev: current.kpPrev,
      mufPrev: current.mufPrev,

      bands: current.bands,

      snapshot: commentary.snapshot,

      forecast24h: forecast.forecast,
    },
    isLoading,
    isError: error,
  };
}