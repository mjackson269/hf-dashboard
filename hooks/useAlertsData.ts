"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useAlertsData() {
  const { data, error, isLoading } = useSWR("/api/alerts", fetcher);

  return {
    data,
    isLoading,
    isError: !!error,
  };
}