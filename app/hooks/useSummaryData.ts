"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSummaryData() {
  const { data, error, isLoading } = useSWR("/api/ai-summary", fetcher, {
    refreshInterval: 60000,
  });

  console.log("SUMMARY DATA:", data);

  return {
    data,              // should be { markdown: "..." }
    isLoading,
    isError: !!error,
  };
}