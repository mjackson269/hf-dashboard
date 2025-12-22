"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useForecastData() {
  const { data, error, isLoading } = useSWR("/api/forecast", fetcher);

  return {
    data,
    isLoading,
    isError: !!error,
  };
}