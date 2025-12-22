"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.text());

export function useSummaryData() {
  const { data, error, isLoading } = useSWR("/api/summary", fetcher);

  return {
    data,
    isLoading,
    isError: !!error,
  };
}